import type { PoolClient } from 'pg';

/**
 * Every balance movement in the system goes through this module.
 *
 * All functions take an existing transaction client rather than the pool: a
 * trade moves two assets, and a partial application (base credited, quote never
 * debited) would be free money. The caller owns the BEGIN/COMMIT so both legs
 * land together or neither does.
 */

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
  /** Positive to credit, negative to debit. */
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

/**
 * Applies a credit or debit and records it in the ledger.
 *
 * Arithmetic happens in Postgres NUMERIC, never in JavaScript floats —
 * 0.1 + 0.2 !== 0.3 is a rounding curiosity in most code and a loss of customer
 * funds in this one.
 */
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
  // Ensure the row exists, then update it separately.
  //
  // This deliberately avoids `INSERT ... VALUES (delta) ON CONFLICT DO UPDATE`:
  // Postgres validates CHECK constraints against the candidate row *before*
  // resolving the conflict, so a negative delta trips balance >= 0 even when
  // the row already exists and the UPDATE branch would have been fine.
  await client.query(
    `INSERT INTO wallets (user_id, asset_symbol, balance)
     VALUES ($1, $2, 0) ON CONFLICT (user_id, asset_symbol) DO NOTHING;`,
    [userId, asset]
  );

  const result = await client.query(
    `
    UPDATE wallets
    SET balance = balance + $3::numeric, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2
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

/**
 * Locks funds behind a resting order. Locked funds stay in `balance` (the user
 * still owns them) but are excluded from spendable, so a second order cannot
 * claim the same coins.
 */
export const lockFunds = async (
  client: PoolClient,
  userId: number,
  asset: string,
  amount: number | string
): Promise<void> => {
  const result = await client.query(
    `
    UPDATE wallets
    SET locked = locked + $3::numeric, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2
      AND balance - locked >= $3::numeric
    RETURNING locked;
    `,
    [userId, asset, String(amount)]
  );

  // No row updated means the guard failed: not enough spendable balance.
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
  await client.query(
    `
    UPDATE wallets
    SET locked = GREATEST(0, locked - $3::numeric), updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2;
    `,
    [userId, asset, String(amount)]
  );
};

/**
 * Spends funds that were previously locked: reduces both locked and balance.
 * Used when a resting order fills.
 */
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

/**
 * Debits an unlocked balance, refusing to overdraw.
 *
 * The `balance - locked >= amount` guard lives in the WHERE clause so the check
 * and the write are one atomic statement. Reading the balance first and then
 * updating would let two concurrent requests both pass the check.
 */
export const debitAvailable = async (
  client: PoolClient,
  userId: number,
  asset: string,
  amount: number | string,
  reason: LedgerReason,
  refType?: string,
  refId?: number | string
): Promise<string> => {
  const result = await client.query(
    `
    UPDATE wallets
    SET balance = balance - $3::numeric, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND asset_symbol = $2
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
