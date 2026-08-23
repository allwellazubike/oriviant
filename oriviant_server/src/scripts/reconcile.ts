import pool from '../config/db.js';

/**
 * Verifies that every wallet balance equals the sum of its ledger history.
 *
 *   npm run reconcile
 *
 * A mismatch means some code path moved money without recording it, which is
 * the one bug class you cannot recover from after the fact. Worth running
 * before and after any change to balance handling, and on a schedule in prod.
 */
const run = async () => {
  const result = await pool.query(`
    SELECT
      w.user_id,
      u.email,
      w.asset_symbol,
      w.balance::text                                  AS balance,
      COALESCE(l.total, 0)::text                       AS ledger_total,
      (w.balance - COALESCE(l.total, 0))::text         AS drift
    FROM wallets w
    JOIN users u ON u.id = w.user_id
    LEFT JOIN (
      SELECT user_id, asset_symbol, SUM(delta) AS total
      FROM ledger_entries
      GROUP BY user_id, asset_symbol
    ) l ON l.user_id = w.user_id AND l.asset_symbol = w.asset_symbol
    ORDER BY w.user_id, w.asset_symbol;
  `);

  const mismatches = result.rows.filter((r) => Number(r.drift) !== 0);

  console.log(`Checked ${result.rows.length} wallet(s).`);

  for (const row of result.rows) {
    const ok = Number(row.drift) === 0;
    console.log(
      `  ${ok ? 'OK  ' : 'DRIFT'} ${row.email} ${row.asset_symbol}: ` +
        `balance=${row.balance} ledger=${row.ledger_total}` +
        (ok ? '' : ` drift=${row.drift}`)
    );
  }

  // Locked funds must always be backed by an open order.
  const orphanLocks = await pool.query(`
    SELECT w.user_id, u.email, w.asset_symbol, w.locked::text AS locked,
           COALESCE(o.total, 0)::text AS open_order_locks
    FROM wallets w
    JOIN users u ON u.id = w.user_id
    LEFT JOIN (
      SELECT user_id, locked_asset, SUM(locked_amount) AS total
      FROM orders WHERE status = 'OPEN'
      GROUP BY user_id, locked_asset
    ) o ON o.user_id = w.user_id AND o.locked_asset = w.asset_symbol
    WHERE w.locked <> COALESCE(o.total, 0);
  `);

  if (orphanLocks.rows.length > 0) {
    console.log('\nLOCK MISMATCHES (locked funds not backed by an open order):');
    for (const row of orphanLocks.rows) {
      console.log(
        `  ${row.email} ${row.asset_symbol}: locked=${row.locked} open_orders=${row.open_order_locks}`
      );
    }
  }

  const failed = mismatches.length > 0 || orphanLocks.rows.length > 0;
  console.log(failed ? '\nRECONCILIATION FAILED' : '\nRECONCILIATION PASSED');
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error('Reconciliation error:', err);
  process.exit(1);
});
