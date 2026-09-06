import type { PoolClient } from 'pg';

export type LedgerReason =
  | 'DEPOSIT_APPROVED'
  | 'TRADE_BUY'
  | 'TRADE_SELL'
  | 'TRADE_FEE'
  | 'ORDER_LOCK'
  | 'ORDER_UNLOCK';

interface MovementOptions {
  client: PoolClient;
  userId: number;
  asset: string;
  delta: number | string;
  reason: LedgerReason;
  refType?: string;
  refId?: number | string;
  metadata?: Record<string, unknown>;
}

export class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientFundsError';
  }
}

export const applyMovement = async ({
  client,
  userId,
  asset,
  delta,
  reason,
  refType,
  refId,
  metadata,
}: MovementOptions): Promise<string> => {
  
  // FIX: Updated ON CONFLICT to match composite index (user_id, asset_symbol, wallet_type)
  await client.query(
    `INSERT INTO wallets (user_id, asset_symbol, wallet_type, balance)
     VALUES ($1, $2, 'spot', 0) ON CONFLICT (user_id, asset_symbol, wallet_type) DO NOTHING;`,
    [userId, asset]
  );

  // FIX: Explicitly target the spot wallet
  const result = await client.query(
    `
    UPDATE wallets
    SET balance = balance + $3::numeric, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2 AND wallet_type = 'spot'
    RETURNING balance;
    `,
    [userId, asset, String(delta)]
  );

  const balanceAfter = result.rows[0].balance as string;

  await client.query(
    `
    INSERT INTO ledger_entries
      (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
    [
      userId,
      asset,
      String(delta),
      balanceAfter,
      reason,
      refType ?? null,
      refId ?? null,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );

  return balanceAfter;
};

export const lockFunds = async (
  client: PoolClient,
  userId: number,
  asset: string,
  amount: number | string
): Promise<void> => {
  // FIX: Explicitly target the spot wallet
  const result = await client.query(
    `
    UPDATE wallets
    SET locked = locked + $3::numeric, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2 AND wallet_type = 'spot'
      AND balance - locked >= $3::numeric
    RETURNING locked;
    `,
    [userId, asset, String(amount)]
  );

  if (result.rowCount === 0) {
    throw new InsufficientFundsError(`Insufficient available ${asset} balance.`);
  }
};

export const unlockFunds = async (
  client: PoolClient,
  userId: number,
  asset: string,
  amount: number | string
): Promise<void> => {
  // FIX: Explicitly target the spot wallet
  await client.query(
    `
    UPDATE wallets
    SET locked = GREATEST(0, locked - $3::numeric), updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2 AND wallet_type = 'spot';
    `,
    [userId, asset, String(amount)]
  );
};

export const spendLockedFunds = async (
  client: PoolClient,
  userId: number,
  asset: string,
  amount: number | string,
  reason: LedgerReason,
  refType?: string,
  refId?: number | string
): Promise<void> => {
  await unlockFunds(client, userId, asset, amount);
  await applyMovement({
    client,
    userId,
    asset,
    delta: `-${amount}`,
    reason,
    refType,
    refId,
  });
};

export const debitAvailable = async (
  client: PoolClient,
  userId: number,
  asset: string,
  amount: number | string,
  reason: LedgerReason,
  refType?: string,
  refId?: number | string
): Promise<string> => {
  // FIX: Explicitly target the spot wallet
  const result = await client.query(
    `
    UPDATE wallets
    SET balance = balance - $3::numeric, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2 AND wallet_type = 'spot'
      AND balance - locked >= $3::numeric
    RETURNING balance;
    `,
    [userId, asset, String(amount)]
  );

  if (result.rowCount === 0) {
    throw new InsufficientFundsError(`Insufficient available ${asset} balance.`);
  }

  const balanceAfter = result.rows[0].balance as string;

  await client.query(
    `
    INSERT INTO ledger_entries
      (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
    [userId, asset, `-${amount}`, balanceAfter, reason, refType ?? null, refId ?? null]
  );

  return balanceAfter;
};