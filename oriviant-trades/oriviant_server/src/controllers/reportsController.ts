import { Request, Response } from 'express';
import pool from '../config/db.js';

/**
 * Minimal CSV serialization: quotes any field containing a comma, quote, or
 * newline, doubling internal quotes per RFC 4180. Good enough for admin
 * exports — no need for a dependency here.
 */
const toCsv = (rows: Record<string, any>[]): string => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = value instanceof Date ? value.toISOString() : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
};

const parseDateRange = (req: Request): { start: string; end: string } => {
  const start = typeof req.query.startDate === 'string' ? req.query.startDate : '2000-01-01';
  const end = typeof req.query.endDate === 'string' ? req.query.endDate : new Date().toISOString().slice(0, 10);
  return { start, end };
};

const CATEGORY_QUERIES: Record<string, (start: string, end: string) => Promise<Record<string, any>[]>> = {
  users: async (start, end) => {
    const res = await pool.query(
      `SELECT id, email, nickname, role, created_at
       FROM users WHERE created_at BETWEEN $1 AND $2::date + INTERVAL '1 day'
       ORDER BY created_at DESC LIMIT 5000;`,
      [start, end]
    );
    return res.rows;
  },
  deposits: async (start, end) => {
    const res = await pool.query(
      `SELECT id, user_id, asset, amount_expected, amount_credited, network, tx_hash, status, created_at, updated_at
       FROM deposit_requests WHERE created_at BETWEEN $1 AND $2::date + INTERVAL '1 day'
       ORDER BY created_at DESC LIMIT 5000;`,
      [start, end]
    );
    return res.rows;
  },
  withdrawals: async (start, end) => {
    const res = await pool.query(
      `SELECT id, user_id, asset, amount, fee, receive_amount, network, recipient_address, status, tx_hash, created_at, updated_at
       FROM withdrawals WHERE created_at BETWEEN $1 AND $2::date + INTERVAL '1 day'
       ORDER BY created_at DESC LIMIT 5000;`,
      [start, end]
    );
    return res.rows;
  },
  trading: async (start, end) => {
    const res = await pool.query(
      `SELECT id, user_id, pair, side, type, amount, fill_price, fee, status, created_at
       FROM orders WHERE created_at BETWEEN $1 AND $2::date + INTERVAL '1 day'
       ORDER BY created_at DESC LIMIT 5000;`,
      [start, end]
    );
    return res.rows;
  },
  revenue: async (start, end) => {
    const res = await pool.query(
      `SELECT
         d::date AS date,
         COALESCE((SELECT SUM(fee) FROM orders o WHERE o.status = 'FILLED' AND o.created_at::date = d), 0) AS spot_fees,
         COALESCE((SELECT SUM(fee) FROM withdrawals w WHERE w.status IN ('APPROVED','COMPLETED') AND w.created_at::date = d), 0) AS withdrawal_fees,
         COALESCE((SELECT SUM(profit_share_fee) FROM copy_positions cp WHERE cp.closed_at::date = d), 0) AS copy_trading_fees
       FROM generate_series($1::date, $2::date, INTERVAL '1 day') d
       ORDER BY d DESC;`,
      [start, end]
    );
    return res.rows;
  },
  analytics: async (start, end) => {
    const res = await pool.query(
      `SELECT
         COUNT(DISTINCT user_id) FILTER (WHERE status = 'Success')::int AS active_users,
         COUNT(*) FILTER (WHERE status = 'Success')::int AS successful_logins,
         COUNT(*) FILTER (WHERE status = 'Failed')::int AS failed_logins
       FROM login_history WHERE created_at BETWEEN $1 AND $2::date + INTERVAL '1 day';`,
      [start, end]
    );
    return res.rows;
  },
  reviews: async () => {
    // No review system exists yet — an honest empty export rather than a
    // fabricated one.
    return [];
  }
};

export const getReportCounts = async (_req: Request, res: Response) => {
  try {
    const [users, deposits, withdrawals, orders, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM users'),
      pool.query('SELECT COUNT(*)::int AS n FROM deposit_requests'),
      pool.query('SELECT COUNT(*)::int AS n FROM withdrawals'),
      pool.query('SELECT COUNT(*)::int AS n FROM orders'),
      pool.query(`SELECT COALESCE(SUM(fee), 0)::float AS total FROM orders WHERE status = 'FILLED'`)
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows[0].n,
        deposits: deposits.rows[0].n,
        withdrawals: withdrawals.rows[0].n,
        trading: orders.rows[0].n,
        revenue: revenue.rows[0].total,
        analytics: users.rows[0].n,
        reviews: 0
      }
    });
  } catch (err: any) {
    console.error('Error fetching report counts:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const queryFn = CATEGORY_QUERIES[category];

    if (!queryFn) {
      return res.status(400).json({ success: false, error: `Unknown report category "${category}".` });
    }

    const { start, end } = parseDateRange(req);
    const rows = await queryFn(start, end);
    const csv = toCsv(rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="oriviant_${category}_${start}_to_${end}.csv"`);
    res.status(200).send(rows.length > 0 ? csv : 'No records found in this date range.\n');
  } catch (err: any) {
    console.error('Error exporting report:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
