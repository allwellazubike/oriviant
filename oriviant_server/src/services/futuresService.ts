import pool from '../config/db.js';
import { getMarketPrice } from './priceOracle.js';

export const futuresService = {
  openPosition: async (
    userId: number, 
    symbol: string, 
    side: 'LONG' | 'SHORT', 
    marginMode: 'ISOLATED' | 'CROSS', 
    leverage: number, 
    collateralAmount: number,
    tpPrice?: number,
    slPrice?: number
  ) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch live price FIRST from the robust Oracle so we don't lock wallets if it fails
      let entryPrice: number;
      try {
        entryPrice = await getMarketPrice(symbol);
      } catch (error) {
        throw new Error(`Live price temporarily unavailable for ${symbol}. Please try again.`);
      }

      if (!entryPrice || entryPrice <= 0) {
        throw new Error(`Invalid market price received for ${symbol}.`);
      }

      // 2. Lock the wallet to verify and deduct USDT collateral from the FUTURES wallet
      const asset = 'USDT'; 
      const walletRes = await client.query(
        'SELECT balance, locked FROM wallets WHERE user_id = $1 AND asset_symbol = $2 AND wallet_type = $3 FOR UPDATE',
        [userId, asset, 'futures']
      );

      if (walletRes.rows.length === 0) throw new Error('USDT Futures wallet not found. Please transfer funds to Futures.');
      
      const balance = Number(walletRes.rows[0].balance);
      const locked = Number(walletRes.rows[0].locked);
      const available = balance - locked;

      if (available < collateralAmount) {
        throw new Error(`Insufficient USDT margin in Futures Wallet. Available: $${available.toFixed(2)}`);
      }

      // 3. Lock the collateral (move from available to locked in the futures wallet)
      await client.query(
        'UPDATE wallets SET locked = locked + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3 AND wallet_type = $4',
        [collateralAmount, userId, asset, 'futures']
      );

      // 4. Engine Math: Compute Size and Liquidation Price
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

      // Validate user TP/SL inputs
      if (side === 'LONG') {
        if (tpPrice && tpPrice <= entryPrice) throw new Error('Take Profit must be higher than entry price for LONG.');
        if (slPrice && slPrice >= entryPrice) throw new Error('Stop Loss must be lower than entry price for LONG.');
      } else {
        if (tpPrice && tpPrice >= entryPrice) throw new Error('Take Profit must be lower than entry price for SHORT.');
        if (slPrice && slPrice <= entryPrice) throw new Error('Stop Loss must be higher than entry price for SHORT.');
      }

      // 5. Create Position
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
      let exitPrice: number;
      try {
        exitPrice = await getMarketPrice(position.market_symbol);
      } catch (error) {
        throw new Error(`Live price unavailable to close position. Try again.`);
      }

      const entryPrice = Number(position.entry_price);
      const size = Number(position.size);
      
      let pnl = 0;
      if (position.side === 'LONG') {
        pnl = (exitPrice - entryPrice) * size;
      } else {
        pnl = (entryPrice - exitPrice) * size;
      }

      // 3. Update Wallet (Release margin back to available + apply PnL to the FUTURES wallet)
      const originalMargin = Number(position.margin);
      const balanceChange = pnl; // Can be negative

      await client.query(
        'UPDATE wallets SET balance = balance + $1, locked = locked - $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND asset_symbol = $4 AND wallet_type = $5',
        [balanceChange, originalMargin, userId, 'USDT', 'futures']
      );

      // 4. Record Ledger Entry
      await client.query(
        `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id)
         VALUES ($1, 'USDT', $2, (SELECT balance FROM wallets WHERE user_id = $1 AND asset_symbol = 'USDT' AND wallet_type = 'futures'), 'FUTURES_CLOSE_PNL', 'futures_position', $3)`,
        [userId, balanceChange, positionId]
      );

      // 5. Mark Position Closed
      const closedPosRes = await client.query(
        `UPDATE futures_positions SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [positionId]
      );

      await client.query('COMMIT');
      return { ...closedPosRes.rows[0], pnl, exit_price: exitPrice };
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