import pool from '../config/db.js';
import { websocketService } from './websocketService.js';

export type NotificationCategory = 'alert' | 'execution' | 'copy' | 'system' | 'promotion';

export interface NotificationInput {
  title: string;
  message: string;
  category: NotificationCategory;
  linkTab?: string;
}

const round = (v: number, dp = 2): string => v.toFixed(dp);

/** Money formatting for notification copy — plain and consistent everywhere. */
export const fmt = (amount: number, symbol = ''): string =>
  `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}${symbol ? ' ' + symbol : ''}`;

/**
 * Creates one notification and pushes it over the socket immediately if the
 * user is connected. The DB row is the source of truth — the socket push is
 * just so a connected client doesn't have to wait for its next poll.
 */
export const createNotification = async (userId: number, input: NotificationInput) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, category, link_tab)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [userId, input.title, input.message, input.category, input.linkTab ?? null]
    );

    const row = result.rows[0];
    websocketService.pushNotification(userId, row);
    return row;
  } catch (err) {
    // A notification failing to write must never take down the trade/deposit/
    // withdrawal action that triggered it.
    console.error('[notifications] Failed to create notification:', (err as Error).message);
    return null;
  }
};

/**
 * Bulk-creates the same notification for many users (admin broadcasts). One
 * multi-row INSERT rather than N round trips.
 */
export const createNotificationForUsers = async (userIds: number[], input: NotificationInput): Promise<number> => {
  if (userIds.length === 0) return 0;

  const values: string[] = [];
  const params: any[] = [];
  userIds.forEach((userId, i) => {
    const base = i * 5;
    values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
    params.push(userId, input.title, input.message, input.category, input.linkTab ?? null);
  });

  const result = await pool.query(
    `INSERT INTO notifications (user_id, title, message, category, link_tab)
     VALUES ${values.join(', ')}
     RETURNING user_id;`,
    params
  );

  for (const row of result.rows) {
    websocketService.pushNotification(row.user_id, { title: input.title, message: input.message, category: input.category, link_tab: input.linkTab });
  }

  return result.rows.length;
};

export const listNotifications = async (userId: number, limit = 50) => {
  const result = await pool.query(
    `SELECT id, title, message, category, link_tab, read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2;`,
    [userId, limit]
  );
  return result.rows;
};

export const markNotificationRead = async (userId: number, id: number) => {
  await pool.query(`UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`, [id, userId]);
};

export const markAllNotificationsRead = async (userId: number) => {
  await pool.query(`UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`, [userId]);
};

/* ------------------------------------------------------------------ *
 * Event-specific helpers — one per real trigger, so call sites read as
 * plain English instead of re-deriving copy at every call site.
 * ------------------------------------------------------------------ */

export const notifyOrderPlaced = (userId: number, pair: string, side: string, amount: number) =>
  createNotification(userId, {
    title: 'Limit Order Placed',
    message: `Your ${side.toUpperCase()} order for ${fmt(amount)} ${pair} is open and waiting to fill.`,
    category: 'execution',
    linkTab: 'spot'
  });

export const notifyOrderFilled = (userId: number, pair: string, side: string, amount: number, price: number) =>
  createNotification(userId, {
    title: 'Order Filled',
    message: `${side.toUpperCase()} ${fmt(amount)} ${pair.split('/')[0]} filled at ${round(price)} ${pair.split('/')[1] || 'USDT'}.`,
    category: 'execution',
    linkTab: 'spot'
  });

export const notifyOrderCancelled = (userId: number, pair: string, side: string, amount: number) =>
  createNotification(userId, {
    title: 'Order Cancelled',
    message: `Your ${side.toUpperCase()} order for ${fmt(amount)} ${pair} was cancelled and funds were released.`,
    category: 'execution',
    linkTab: 'spot'
  });

export const notifyPositionOpened = (userId: number, symbol: string, side: string, leverage: number) =>
  createNotification(userId, {
    title: 'Futures Position Opened',
    message: `${side} ${symbol} opened at ${leverage}x leverage.`,
    category: 'execution',
    linkTab: 'futures'
  });

export const notifyPositionClosed = (userId: number, symbol: string, side: string, pnl: number) =>
  createNotification(userId, {
    title: 'Futures Position Closed',
    message: `${side} ${symbol} closed with ${pnl >= 0 ? 'a profit of' : 'a loss of'} ${fmt(Math.abs(pnl))} USDT.`,
    category: 'execution',
    linkTab: 'futures'
  });

export const notifyDepositPending = (userId: number, asset: string, amount: number) =>
  createNotification(userId, {
    title: 'Deposit Submitted',
    message: `Your deposit of ${fmt(amount)} ${asset} is pending review. We'll notify you once it's credited.`,
    category: 'system',
    linkTab: 'assets'
  });

export const notifyDepositCompleted = (userId: number, asset: string, amount: number) =>
  createNotification(userId, {
    title: 'Deposit Completed',
    message: `${fmt(amount)} ${asset} has been credited to your account.`,
    category: 'system',
    linkTab: 'assets'
  });

export const notifyDepositRejected = (userId: number, asset: string) =>
  createNotification(userId, {
    title: 'Deposit Rejected',
    message: `Your ${asset} deposit could not be verified. Contact support if you believe this is a mistake.`,
    category: 'system',
    linkTab: 'assets'
  });

export const notifyWithdrawalPending = (userId: number, asset: string, amount: number) =>
  createNotification(userId, {
    title: 'Withdrawal Requested',
    message: `Your withdrawal of ${fmt(amount)} ${asset} is pending review.`,
    category: 'system',
    linkTab: 'assets'
  });

export const notifyWithdrawalCompleted = (userId: number, asset: string, amount: number) =>
  createNotification(userId, {
    title: 'Withdrawal Completed',
    message: `${fmt(amount)} ${asset} has been sent to your withdrawal address.`,
    category: 'system',
    linkTab: 'assets'
  });

export const notifyWithdrawalRejected = (userId: number, asset: string, amount: number) =>
  createNotification(userId, {
    title: 'Withdrawal Rejected',
    message: `Your withdrawal of ${fmt(amount)} ${asset} was rejected and the funds were returned to your balance.`,
    category: 'system',
    linkTab: 'assets'
  });

/* ------------------------------------------------------------------ *
 * Admin broadcasts
 * ------------------------------------------------------------------ */

export type BroadcastAudience = 'all' | 'active_traders';

const resolveAudienceUserIds = async (audience: BroadcastAudience): Promise<number[]> => {
  if (audience === 'active_traders') {
    const result = await pool.query(`
      SELECT DISTINCT user_id FROM (
        SELECT user_id FROM orders
        UNION
        SELECT user_id FROM futures_positions
      ) traders;
    `);
    return result.rows.map((r) => r.user_id);
  }

  const result = await pool.query('SELECT id FROM users');
  return result.rows.map((r) => r.id);
};

export const createBroadcast = async (params: {
  title: string;
  message: string;
  severity: string;
  audience: BroadcastAudience;
  sentBy: number;
}) => {
  const userIds = await resolveAudienceUserIds(params.audience);

  const category: NotificationCategory =
    params.severity === 'alert' ? 'alert' : params.severity === 'success' ? 'promotion' : 'system';

  const recipientCount = await createNotificationForUsers(userIds, {
    title: params.title,
    message: params.message,
    category
  });

  const result = await pool.query(
    `INSERT INTO broadcasts (title, message, severity, audience, sent_by, recipient_count)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *;`,
    [params.title, params.message, params.severity, params.audience, params.sentBy, recipientCount]
  );

  return result.rows[0];
};

export const listBroadcasts = async (limit = 50) => {
  const result = await pool.query(
    `SELECT b.*, u.email as sent_by_email, u.nickname as sent_by_name
     FROM broadcasts b
     LEFT JOIN users u ON u.id = b.sent_by
     ORDER BY b.created_at DESC
     LIMIT $1;`,
    [limit]
  );
  return result.rows;
};
