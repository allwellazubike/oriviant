import pool from '../config/db.js';

const STARTING_BALANCE = 10000;

/**
 * Server-side record of Practice (paper trading) mode. The client still
 * simulates fills instantly against live prices — see DemoModeContext on the
 * frontend — this only persists the outcome so admins can see real per-user
 * practice activity and a real leaderboard, instead of each browser's
 * simulation being invisible to the backend.
 */
export const ensureAccount = async (userId: number) => {
  const result = await pool.query(
    `INSERT INTO practice_accounts (user_id, balance, starting_balance)
     VALUES ($1, $2, $2)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *;`,
    [userId, STARTING_BALANCE]
  );

  if (result.rows.length > 0) return result.rows[0];

  const existing = await pool.query('SELECT * FROM practice_accounts WHERE user_id = $1', [userId]);
  return existing.rows[0];
};

export const getAccount = async (userId: number) => {
  return ensureAccount(userId);
};

export const recordTrade = async (
  userId: number,
  input: { pair?: string; side?: string; description?: string; pnl: number }
) => {
  await ensureAccount(userId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const account = await client.query(
      `UPDATE practice_accounts
       SET balance = balance + $1, total_trades = total_trades + 1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *;`,
      [input.pnl, userId]
    );

    const updated = account.rows[0];

    await client.query(
      `INSERT INTO practice_trades (user_id, pair, side, description, pnl, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [userId, input.pair ?? null, input.side ?? null, input.description ?? null, input.pnl, updated.balance]
    );

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const resetAccount = async (userId: number) => {
  await ensureAccount(userId);
  const result = await pool.query(
    `UPDATE practice_accounts
     SET balance = starting_balance, total_trades = 0, last_reset_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING *;`,
    [userId]
  );
  return result.rows[0];
};

export const resetAllAccounts = async (): Promise<number> => {
  const result = await pool.query(
    `UPDATE practice_accounts
     SET balance = starting_balance, total_trades = 0, last_reset_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     RETURNING user_id;`
  );
  return result.rows.length;
};

export const listAccountsForAdmin = async () => {
  const result = await pool.query(`
    SELECT pa.user_id, u.email, u.nickname, pa.balance, pa.starting_balance,
           pa.total_trades, pa.last_reset_at, pa.updated_at
    FROM practice_accounts pa
    JOIN users u ON u.id = pa.user_id
    ORDER BY pa.updated_at DESC
    LIMIT 200;
  `);
  return result.rows;
};

export const getLeaderboard = async (limit = 20) => {
  const result = await pool.query(
    `SELECT pa.user_id, u.email, u.nickname, pa.balance, pa.starting_balance, pa.total_trades,
            (pa.balance - pa.starting_balance) AS pnl
     FROM practice_accounts pa
     JOIN users u ON u.id = pa.user_id
     WHERE pa.total_trades > 0
     ORDER BY pnl DESC
     LIMIT $1;`,
    [limit]
  );
  return result.rows;
};
