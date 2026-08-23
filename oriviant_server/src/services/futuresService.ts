import pool from '../config/db.js';
import { marketDataService } from './marketDataService.js';

// Live price feed connected via marketDataService
const getLivePrice = async (symbol: string): Promise<number> => {
  const quote = await marketDataService.fetchLivePrice(symbol);
  return quote.price;
};

export const futuresService = {
  openPosition: async (
    userId: number, 
    symbol: string, 
    side: 'LONG' | 'SHORT', 
    marginMode: 'ISOLATED' | 'CROSS', 
    leverage: number, 
    collateralAmount: number
  ) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock the wallet to verify and deduct USDT collateral
      const asset = 'USDT'; // Futures margin is usually settled in USDT
      const walletRes = await client.query(
        'SELECT balance, locked FROM wallets WHERE user_id = $1 AND asset_symbol = $2 FOR UPDATE',
        [userId, asset]
      );

      if (walletRes.rows.length === 0) throw new Error('USDT wallet not found for margin collateral.');
      
      const balance = Number(walletRes.rows[0].balance);
      const locked = Number(walletRes.rows[0].locked);
      const available = balance - locked;

      if (available < collateralAmount) {
        throw new Error(`Insufficient USDT margin. Available: ${available}`);
      }

      // 2. Lock the collateral (move from available to locked)
      await client.query(
        'UPDATE wallets SET locked = locked + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3',
        [collateralAmount, userId, asset]
      );

      // 3. Engine Math: Compute Size and Liquidation Price
      const entryPrice = await getLivePrice(symbol);
      const notionalValue = collateralAmount * leverage;
      const size = notionalValue / entryPrice;

      // Maintenance margin factor (e.g., 10% buffer before total wipeout)
      const liqFactor = (100 / leverage) * 0.9; 
      let liqPrice = 0;
      if (side === 'LONG') {
        liqPrice = entryPrice * (1 - liqFactor / 100);
      } else {
        liqPrice = entryPrice * (1 + liqFactor / 100);
      }

      // 4. Create Position
      const posRes = await client.query(
        `INSERT INTO futures_positions 
        (user_id, market_symbol, side, margin_mode, leverage, margin, size, entry_price, liquidation_price, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'OPEN') RETURNING *`,
        [userId, symbol, side, marginMode, leverage, collateralAmount, size, entryPrice, liqPrice]
      );

      await client.query('COMMIT');
      return posRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  closePosition: async (positionId: number, userId: number) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock the position
      const posRes = await client.query(
        'SELECT * FROM futures_positions WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [positionId, userId]
      );

      if (posRes.rows.length === 0) throw new Error('Position not found');
      const position = posRes.rows[0];

      if (position.status !== 'OPEN') throw new Error('Position is already closed or liquidated');

      // 2. Calculate Realized PnL
      const exitPrice = await getLivePrice(position.market_symbol);
      const entryPrice = Number(position.entry_price);
      const size = Number(position.size);
      
      let pnl = 0;
      if (position.side === 'LONG') {
        pnl = (exitPrice - entryPrice) * size;
      } else {
        pnl = (entryPrice - exitPrice) * size;
      }

      // 3. Update Wallet (Release margin back to available + apply PnL)
      // Total returned to available balance = original margin + pnl
      const originalMargin = Number(position.margin);
      const balanceChange = pnl; // Can be negative

      await client.query(
        'UPDATE wallets SET balance = balance + $1, locked = locked - $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND asset_symbol = $4',
        [balanceChange, originalMargin, userId, 'USDT']
      );

      // 4. Record Ledger Entry
      await client.query(
        `INSERT INTO ledger_entries (user_id, asset_symbol, delta, reason, ref_type, ref_id)
         VALUES ($1, 'USDT', $2, 'FUTURES_CLOSE_PNL', 'futures_position', $3)`,
        [userId, balanceChange, positionId]
      );

      // 5. Mark Position Closed
      const closedPosRes = await client.query(
        `UPDATE futures_positions SET status = 'CLOSED', realized_pnl = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [pnl, positionId]
      );

      await client.query('COMMIT');
      return closedPosRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getUserPositions: async (userId: number) => {
    const res = await pool.query(
      'SELECT * FROM futures_positions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, 'OPEN']
    );
    return res.rows;
  },

  updateLeverage: async (userId: number, symbol: string, newLeverage: number) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // We will only update leverage for OPEN positions of this symbol
      const posRes = await client.query(
        'SELECT * FROM futures_positions WHERE user_id = $1 AND market_symbol = $2 AND status = $3 FOR UPDATE',
        [userId, symbol, 'OPEN']
      );

      if (posRes.rows.length === 0) {
        throw new Error('No open positions found for this market to update leverage.');
      }

      for (const pos of posRes.rows) {
        const entryPrice = Number(pos.entry_price);
        
        // Recalculate Liquidation Price based on new leverage
        const liqFactor = (100 / newLeverage) * 0.9; 
        let newLiqPrice = 0;
        if (pos.side === 'LONG') {
          newLiqPrice = entryPrice * (1 - liqFactor / 100);
        } else {
          newLiqPrice = entryPrice * (1 + liqFactor / 100);
        }

        await client.query(
          'UPDATE futures_positions SET leverage = $1, liquidation_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [newLeverage, newLiqPrice, pos.id]
        );
      }

      await client.query('COMMIT');
      return { message: `Leverage updated to ${newLeverage}x` };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};