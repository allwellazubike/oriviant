import pool from '../config/db.js';

/**
 * One place to write an audit row, so every admin mutation endpoint logs the
 * same shape instead of re-deriving the INSERT at each call site. Never
 * throws into the caller — a logging failure must not undo the action it was
 * describing (the deposit is already approved by the time this runs).
 */
export const logAudit = async (
  adminId: number,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, any>,
  ipAddress?: string | null
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, action, targetType, targetId, JSON.stringify(details), ipAddress ?? null]
    );
  } catch (err) {
    console.error('[audit] Failed to write audit log:', (err as Error).message);
  }
};

export const adminService = {
  getPendingTransactions: async () => {
    const depRes = await pool.query("SELECT * FROM deposit_requests WHERE status = 'PENDING' ORDER BY created_at DESC");
    const wthRes = await pool.query("SELECT * FROM withdrawals WHERE status = 'PENDING' ORDER BY created_at DESC");
    
    return { 
      deposits: depRes.rows, 
      withdrawals: wthRes.rows 
    };
  },

  resolveDeposit: async (adminId: number, depositId: number, action: 'APPROVE' | 'REJECT') => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const status = action === 'APPROVE' ? 'COMPLETED' : 'REJECTED';
      
      const depRes = await client.query(
        "UPDATE deposit_requests SET status = $1, reviewed_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND status = 'PENDING' RETURNING *",
        [status, adminId, depositId]
      );
      
      if (depRes.rows.length === 0) throw new Error('Deposit not found or already resolved');
      const deposit = depRes.rows[0];

      if (action === 'APPROVE') {
        const amount = Number(deposit.amount_expected);
        
        const walletCheck = await client.query('SELECT balance FROM wallets WHERE user_id = $1 AND asset_symbol = $2', [deposit.user_id, deposit.asset]);
        
        if (walletCheck.rows.length === 0) {
            await client.query('INSERT INTO wallets (user_id, asset_symbol, balance) VALUES ($1, $2, $3)', [deposit.user_id, deposit.asset, amount]);
        } else {
            await client.query("UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3", [amount, deposit.user_id, deposit.asset]);
        }

        await client.query(
          `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id) 
           VALUES ($1, $2, $3, (SELECT balance FROM wallets WHERE user_id = $1 AND asset_symbol = $2), 'DEPOSIT_APPROVED', 'deposit', $4)`,
          [deposit.user_id, deposit.asset, amount, deposit.id]
        );
      }
      await client.query('COMMIT');
      return deposit;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  resolveWithdrawal: async (adminId: number, withdrawalId: number, action: 'APPROVE' | 'REJECT') => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const status = action === 'APPROVE' ? 'COMPLETED' : 'REJECTED';
      
      const wthRes = await client.query(
        "UPDATE withdrawals SET status = $1, reviewed_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND status = 'PENDING' RETURNING *",
        [status, adminId, withdrawalId]
      );
      
      if (wthRes.rows.length === 0) throw new Error('Withdrawal not found or already resolved');
      const withdrawal = wthRes.rows[0];

      if (action === 'REJECT') {
        const amount = Number(withdrawal.amount);
        await client.query(
          "UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND asset_symbol = $3",
          [amount, withdrawal.user_id, withdrawal.asset]
        );
        
        await client.query(
          `INSERT INTO ledger_entries (user_id, asset_symbol, delta, balance_after, reason, ref_type, ref_id) 
           VALUES ($1, $2, $3, (SELECT balance FROM wallets WHERE user_id = $1 AND asset_symbol = $2), 'WITHDRAWAL_REJECTED_REFUND', 'withdrawal', $4)`,
          [withdrawal.user_id, withdrawal.asset, amount, withdrawal.id]
        );
      }
      await client.query('COMMIT');
      return withdrawal;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  // FIX: Removed "is_suspended" to stop the user directory from crashing!
  getAllUsers: async (limit = 50, offset = 0) => {
    const res = await pool.query(
      `SELECT id, email, nickname, role, is_verified, vip_level, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countRes = await pool.query('SELECT COUNT(*) FROM users');
    return { users: res.rows, total: parseInt(countRes.rows[0].count, 10) };
  },

  updateUserStatus: async (
    adminId: number,
    targetUserId: number,
    updates: { vip_level?: number; role?: string }
  ) => {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.vip_level !== undefined) {
      fields.push(`vip_level = $${idx++}`);
      values.push(updates.vip_level);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(updates.role);
    }

    if (fields.length === 0) throw new Error('No valid fields provided to update');

    values.push(targetUserId);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, email, nickname, role, vip_level`;
    
    const res = await pool.query(query, values);
    if (res.rows.length === 0) throw new Error('User not found');

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'UPDATE_USER_STATUS', 'user', $2, $3)`,
      [adminId, targetUserId.toString(), JSON.stringify(updates)]
    );

    return res.rows[0];
  },

  getAuditLogs: async (limit = 100) => {
    const res = await pool.query(
      `SELECT a.*, u.email as admin_email, u.nickname as admin_name 
       FROM admin_audit_logs a
       LEFT JOIN users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  },

  getSystemLedgerLogs: async (limit = 100) => {
    const res = await pool.query(
      `SELECT l.*, u.email, u.nickname 
       FROM ledger_entries l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  },

  /**
   * Read live rather than cached: this only runs on the create-order/open-
   * position hot path, which is low-volume enough that one extra indexed
   * lookup per request is cheaper than the risk of a stale in-memory flag
   * leaving maintenance mode "on" after an admin has already turned it off.
   */
  isMaintenanceModeActive: async (): Promise<boolean> => {
    const res = await pool.query(`SELECT value FROM platform_settings WHERE key = 'general'`);
    return Boolean(res.rows[0]?.value?.maintenanceMode);
  },

  areRegistrationsOpen: async (): Promise<boolean> => {
    const res = await pool.query(`SELECT value FROM platform_settings WHERE key = 'general'`);
    const value = res.rows[0]?.value;
    // Default open if the setting has never been touched.
    return value?.allowRegistrations !== false;
  },

  getPlatformSettings: async () => {
    const res = await pool.query('SELECT key, value, updated_at FROM platform_settings');
    const settings: Record<string, any> = {};
    for (const row of res.rows) {
      settings[row.key] = row.value;
    }
    return settings;
  },

  updatePlatformSetting: async (adminId: number, key: string, value: Record<string, any>) => {
    const res = await pool.query(
      `INSERT INTO platform_settings (key, value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [key, JSON.stringify(value)]
    );

    await pool.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
       VALUES ($1, 'UPDATE_PLATFORM_SETTING', 'setting', $2, $3)`,
      [adminId, key, JSON.stringify(value)]
    );

    return res.rows[0];
  },

  // --- CRASH-PROOF DASHBOARD AGGREGATIONS ---
  getDashboardAggregations: async () => {
    
    // FIX: This wrapper catches database errors per-query so the whole board doesn't go to zero!
    const safeQuery = async (queryText: string, defaultRows: any[]) => {
      try {
        const res = await pool.query(queryText);
        return res.rows;
      } catch (err: any) {
        console.error(`[Admin Dashboard SafeQuery] Skipped failing query: ${err.message}`);
        return defaultRows;
      }
    };

    // 1. User Stats (Removed is_suspended to fix the crash)
    const usersRows = await safeQuery(
      `SELECT COUNT(*) as total FROM users`, 
      [{ total: 0 }]
    );
    
    // 2. Deposit Stats
    const depRows = await safeQuery(
      `SELECT status, COALESCE(SUM(amount_expected), 0) as total FROM deposit_requests GROUP BY status`, 
      []
    );
    
    // 3. Withdrawal Stats
    const wthRows = await safeQuery(
      `SELECT status, COALESCE(SUM(amount), 0) as total FROM withdrawals GROUP BY status`, 
      []
    );
    
    // 4. Copy Trading Stats
    const copyRows = await safeQuery(
      `SELECT 
        (SELECT COUNT(*) FROM copy_traders) as active_traders,
        (SELECT COALESCE(SUM(allocated), 0) FROM copy_subscriptions WHERE status = 'ACTIVE') as total_aum,
        (SELECT COUNT(DISTINCT follower_id) FROM copy_subscriptions WHERE status = 'ACTIVE') as active_copiers`, 
      [{ active_traders: 0, total_aum: 0, active_copiers: 0 }]
    );

    // 5. Spot Volume 
    const spotVolRows = await safeQuery(
      `SELECT COALESCE(SUM(amount * COALESCE(limit_price, 1)), 0) as vol FROM orders WHERE status = 'FILLED' AND created_at > NOW() - INTERVAL '24 hours'`, 
      [{ vol: 0 }]
    );

    // 6. Futures Volume
    const futuresVolRows = await safeQuery(
      `SELECT COALESCE(SUM(margin * leverage), 0) as vol FROM futures_positions WHERE created_at > NOW() - INTERVAL '24 hours'`, 
      [{ vol: 0 }]
    );

    // 7. Top Traded Assets
    const topAssetsRows = await safeQuery(
      `SELECT market_symbol as symbol, COALESCE(SUM(margin * leverage), 0) as vol 
       FROM futures_positions 
       WHERE created_at > NOW() - INTERVAL '24 hours' 
       GROUP BY market_symbol 
       ORDER BY vol DESC 
       LIMIT 3`,
      []
    );

    // Map deposit aggregates
    let depApproved = 0, depPending = 0;
    depRows.forEach((r: any) => {
      if (r.status === 'APPROVED' || r.status === 'COMPLETED') depApproved += parseFloat(r.total);
      if (r.status === 'PENDING') depPending += parseFloat(r.total);
    });

    // Map withdrawal aggregates
    let wthApproved = 0, wthPending = 0;
    wthRows.forEach((r: any) => {
      if (r.status === 'APPROVED' || r.status === 'COMPLETED') wthApproved += parseFloat(r.total);
      if (r.status === 'PENDING') wthPending += parseFloat(r.total);
    });

    const futuresVol = parseFloat(futuresVolRows[0]?.vol || '0');
    const spotVol = parseFloat(spotVolRows[0]?.vol || '0');

    return {
      users: {
        total: parseInt(usersRows[0]?.total || '0', 10),
        active: parseInt(usersRows[0]?.total || '0', 10) // Fallback since is_suspended is gone
      },
      financials: {
        depositsApproved: depApproved,
        depositsPending: depPending,
        withdrawalsApproved: wthApproved,
        withdrawalsPending: wthPending
      },
      copyTrading: {
        aum: parseFloat(copyRows[0]?.total_aum || '0'),
        traders: parseInt(copyRows[0]?.active_traders || '0', 10),
        copiers: parseInt(copyRows[0]?.active_copiers || '0', 10)
      },
      volume24h: {
        futures: futuresVol,
        spot: spotVol,
        total: futuresVol + spotVol
      },
      topAssets: topAssetsRows.map((r: any) => ({
        symbol: r.symbol,
        vol: parseFloat(r.vol)
      }))
    };
  },

  /**
   * Backs the Analytics & Traffic admin tab.
   *
   * Every number here comes from data the platform actually records — there
   * is no page-view or device-tracking table, so this deliberately does not
   * attempt device/geographic breakdowns; it only covers the four metrics
   * that have a real source: active users, trading volume, fee revenue, and
   * session length.
   *
   * "Session time" has no dedicated session table to read from, so it is
   * approximated from real signals: for each successful login in the window,
   * the gap between that login and the user's last authenticated request
   * (last_active_at, touched by verifyToken), capped at 2 hours so a token
   * that was never explicitly logged out doesn't blow the average up to days.
   */
  getAnalyticsOverview: async () => {
    const safeQuery = async (queryText: string, defaultRows: any[]) => {
      try {
        const res = await pool.query(queryText);
        return res.rows;
      } catch (err: any) {
        console.error(`[Admin Analytics SafeQuery] Skipped failing query: ${err.message}`);
        return defaultRows;
      }
    };

    const mauRows = await safeQuery(
      `SELECT
         COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS current_mau,
         COUNT(DISTINCT user_id) FILTER (
           WHERE created_at <= NOW() - INTERVAL '30 days' AND created_at > NOW() - INTERVAL '60 days'
         ) AS previous_mau
       FROM login_history
       WHERE status = 'Success'`,
      [{ current_mau: 0, previous_mau: 0 }]
    );

    const volumeRows = await safeQuery(
      `SELECT
         COALESCE(SUM(amount * COALESCE(fill_price, limit_price, 0))
           FILTER (WHERE status = 'FILLED' AND created_at > NOW() - INTERVAL '30 days'), 0) AS spot_current,
         COALESCE(SUM(amount * COALESCE(fill_price, limit_price, 0))
           FILTER (WHERE status = 'FILLED' AND created_at <= NOW() - INTERVAL '30 days'
                     AND created_at > NOW() - INTERVAL '60 days'), 0) AS spot_previous,
         COALESCE(SUM(fee) FILTER (WHERE status = 'FILLED' AND created_at > NOW() - INTERVAL '30 days'), 0) AS spot_fees
       FROM orders`,
      [{ spot_current: 0, spot_previous: 0, spot_fees: 0 }]
    );

    const futuresVolRows = await safeQuery(
      `SELECT
         COALESCE(SUM(margin * leverage) FILTER (WHERE created_at > NOW() - INTERVAL '30 days'), 0) AS futures_current,
         COALESCE(SUM(margin * leverage) FILTER (
           WHERE created_at <= NOW() - INTERVAL '30 days' AND created_at > NOW() - INTERVAL '60 days'
         ), 0) AS futures_previous
       FROM futures_positions`,
      [{ futures_current: 0, futures_previous: 0 }]
    );

    const withdrawalFeeRows = await safeQuery(
      `SELECT COALESCE(SUM(fee), 0) AS total
       FROM withdrawals
       WHERE status IN ('APPROVED', 'COMPLETED') AND created_at > NOW() - INTERVAL '30 days'`,
      [{ total: 0 }]
    );

    const copyFeeRows = await safeQuery(
      `SELECT COALESCE(SUM(profit_share_fee), 0) AS total
       FROM copy_positions
       WHERE closed_at > NOW() - INTERVAL '30 days'`,
      [{ total: 0 }]
    );

    const sessionRows = await safeQuery(
      `SELECT AVG(
         LEAST(EXTRACT(EPOCH FROM (COALESCE(u.last_active_at, lh.created_at) - lh.created_at)), 7200)
       ) AS avg_seconds
       FROM login_history lh
       JOIN users u ON u.id = lh.user_id
       WHERE lh.status = 'Success' AND lh.created_at > NOW() - INTERVAL '30 days'`,
      [{ avg_seconds: 0 }]
    );

    const pctChange = (current: number, previous: number): number | null => {
      if (previous <= 0) return null;
      return ((current - previous) / previous) * 100;
    };

    const currentMau = parseInt(mauRows[0]?.current_mau || '0', 10);
    const previousMau = parseInt(mauRows[0]?.previous_mau || '0', 10);

    const spotCurrent = parseFloat(volumeRows[0]?.spot_current || '0');
    const spotPrevious = parseFloat(volumeRows[0]?.spot_previous || '0');
    const futuresCurrent = parseFloat(futuresVolRows[0]?.futures_current || '0');
    const futuresPrevious = parseFloat(futuresVolRows[0]?.futures_previous || '0');
    const volumeCurrent = spotCurrent + futuresCurrent;
    const volumePrevious = spotPrevious + futuresPrevious;

    const spotFees = parseFloat(volumeRows[0]?.spot_fees || '0');
    const withdrawalFees = parseFloat(withdrawalFeeRows[0]?.total || '0');
    const copyFees = parseFloat(copyFeeRows[0]?.total || '0');
    const revenue = spotFees + withdrawalFees + copyFees;

    const avgSessionSeconds = Math.round(parseFloat(sessionRows[0]?.avg_seconds || '0'));

    return {
      mau: {
        current: currentMau,
        changePct: pctChange(currentMau, previousMau)
      },
      volume30d: {
        total: volumeCurrent,
        spot: spotCurrent,
        futures: futuresCurrent,
        changePct: pctChange(volumeCurrent, volumePrevious)
      },
      revenue30d: {
        total: revenue,
        spotFees,
        withdrawalFees,
        copyTradingFees: copyFees,
        netFeeMarginPct: volumeCurrent > 0 ? (revenue / volumeCurrent) * 100 : 0
      },
      avgSessionSeconds
    };
  }
};