import pool from '../config/db.js';

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
  }
};