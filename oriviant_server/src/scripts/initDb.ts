import pool from '../config/db.js';

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(255),
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Migration for databases created before the role column existed.
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
    -- Profile picture, stored on Cloudinary; this column holds only the URL.
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      asset_symbol VARCHAR(10) NOT NULL,
      wallet_type VARCHAR(20) NOT NULL DEFAULT 'spot',
      balance NUMERIC DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, asset_symbol, wallet_type)
    );

    -- Migration for databases created before wallet segregation existed.
    ALTER TABLE wallets ADD COLUMN IF NOT EXISTS wallet_type VARCHAR(20) NOT NULL DEFAULT 'spot';
    ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_asset_symbol_key;
    
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_user_id_asset_symbol_wallet_type_key') THEN
        ALTER TABLE wallets ADD CONSTRAINT wallets_user_id_asset_symbol_wallet_type_key UNIQUE(user_id, asset_symbol, wallet_type);
      END IF;
    END $$;

    -- 'locked' is the portion reserved by resting limit orders. Spendable funds
    -- are always (balance - locked); balance alone would let a user spend the
    -- same coins twice by placing two orders.
    ALTER TABLE wallets ADD COLUMN IF NOT EXISTS locked NUMERIC NOT NULL DEFAULT 0;

    -- Money must never go negative, and we must never lock more than is held.
    -- Enforced by the database so no future handler can bypass it.
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_balance_non_negative') THEN
        ALTER TABLE wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_locked_valid') THEN
        ALTER TABLE wallets ADD CONSTRAINT wallets_locked_valid CHECK (locked >= 0 AND locked <= balance);
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS deposit_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      asset VARCHAR(10) NOT NULL,
      amount_expected NUMERIC,
      status VARCHAR(20) DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    /*
     * What the admin needs in order to confirm a transfer by hand: the chain it
     * was sent on, the hash to look up in an explorer, and the screenshot the
     * user attached. Added after the fact, so they are nullable — rows filed
     * before this existed simply have none of it.
     */
    ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS network VARCHAR(20);
    ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(120);
    ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS proof_url TEXT;
    -- What the admin actually credited, kept apart from what the user claimed.
    ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS amount_credited NUMERIC;
    /*
     * ON DELETE SET NULL, not the default RESTRICT: removing a staff account
     * must never be blocked by, or cascade into, the deposits they once
     * reviewed. The deposit and its ledger entry are the records that matter;
     * who clicked approve is useful history, not a reason to keep a user row
     * alive forever.
     */
    ALTER TABLE deposit_requests ADD COLUMN IF NOT EXISTS reviewed_by INTEGER;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deposit_requests_reviewed_by_fkey') THEN
        ALTER TABLE deposit_requests
          ADD CONSTRAINT deposit_requests_reviewed_by_fkey
          FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS deposit_requests_status_idx
      ON deposit_requests (status, created_at DESC);

    /* ================= WITHDRAWALS ================= */

    CREATE TABLE IF NOT EXISTS withdrawals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      asset VARCHAR(10) NOT NULL,
      amount NUMERIC NOT NULL,
      fee NUMERIC NOT NULL DEFAULT 0,
      receive_amount NUMERIC NOT NULL,
      network VARCHAR(20) NOT NULL,
      recipient_address TEXT NOT NULL,
      address_nickname VARCHAR(100),
      status VARCHAR(20) DEFAULT 'PENDING',
      tx_hash VARCHAR(120),
      notes TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS withdrawals_status_idx
      ON withdrawals (status, created_at DESC);
    
    CREATE INDEX IF NOT EXISTS withdrawals_user_idx
      ON withdrawals (user_id, created_at DESC);

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'withdrawals_amount_positive') THEN
        ALTER TABLE withdrawals ADD CONSTRAINT withdrawals_amount_positive CHECK (amount > 0);
      END IF;
    END $$;

    /*
     * Password reset codes.
     *
     * The code is stored hashed for the same reason passwords are: a leaked
     * table must not hand over live account access. Rows are consumed by
     * setting used_at rather than deleted, so a support question about "I never
     * got to use my code" has an answer.
     */
    CREATE TABLE IF NOT EXISTS password_resets (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      used_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS password_resets_user_idx
      ON password_resets (user_id, created_at DESC);

    /*
     * Audit trail of sign-in attempts, shown back to the user as "Recent Login
     * Activity" so they can notice access they do not recognize. Failed
     * attempts are recorded too — that is precisely the case a user checking
     * this table is looking for.
     */
    CREATE TABLE IF NOT EXISTS login_history (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ip_address VARCHAR(64),
      device VARCHAR(40),
      browser VARCHAR(40),
      os VARCHAR(40),
      status VARCHAR(20) NOT NULL DEFAULT 'Success',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS login_history_user_idx
      ON login_history (user_id, created_at DESC);

      /*
     * User progression tracking for the Oriviant Academy.
     * Stored permanently so users don't lose XP/streaks if they clear cache.
     * Uses JSONB for flexible array/object storage of lesson IDs and scores.
     */
    CREATE TABLE IF NOT EXISTS academy_progress (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      quiz_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
      total_learning_minutes INTEGER NOT NULL DEFAULT 0,
      daily_streak INTEGER NOT NULL DEFAULT 0,
      last_active_date DATE,
      practice_scenarios_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
      xp_points INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    
    /* ================= COPY TRADING ================= */

    /*
     * Lead traders that followers can copy.
     *
     * is_demo marks seeded showcase profiles whose track record is generated
     * rather than earned. It exists so they can be listed, audited and deleted
     * as a set — a demo trader that cannot be told apart from a real one is how
     * fabricated performance ends up in front of paying customers.
     *
     * base_equity is the notional account size a leader trades against. It is
     * what makes copying proportional: a leader committing 5% of their equity
     * causes each follower to commit 5% of their own allocation, so everyone
     * takes the same relative risk regardless of account size.
     */
    CREATE TABLE IF NOT EXISTS copy_traders (
      id SERIAL PRIMARY KEY,
      handle VARCHAR(40) UNIQUE NOT NULL,
      display_name VARCHAR(80) NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      strategy VARCHAR(40),
      risk_score INTEGER NOT NULL DEFAULT 5,
      verified BOOLEAN NOT NULL DEFAULT false,
      profit_share NUMERIC NOT NULL DEFAULT 0.10,
      base_equity NUMERIC NOT NULL DEFAULT 100000,
      max_followers INTEGER NOT NULL DEFAULT 500,
      is_demo BOOLEAN NOT NULL DEFAULT false,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copy_traders_risk_check') THEN
        ALTER TABLE copy_traders ADD CONSTRAINT copy_traders_risk_check
          CHECK (risk_score BETWEEN 1 AND 10);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copy_traders_share_check') THEN
        ALTER TABLE copy_traders ADD CONSTRAINT copy_traders_share_check
          CHECK (profit_share >= 0 AND profit_share <= 0.5);
      END IF;
    END $$;

    /*
     * A position the leader has taken, expressed as a share of their equity.
     *
     * size_pct rather than an absolute amount, because followers have different
     * allocations and must scale to their own.
     */
    CREATE TABLE IF NOT EXISTS copy_trader_trades (
      id BIGSERIAL PRIMARY KEY,
      trader_id INTEGER NOT NULL REFERENCES copy_traders(id) ON DELETE CASCADE,
      pair VARCHAR(20) NOT NULL,
      base_asset VARCHAR(10) NOT NULL,
      quote_asset VARCHAR(10) NOT NULL,
      side VARCHAR(4) NOT NULL DEFAULT 'buy',
      size_pct NUMERIC NOT NULL,
      entry_price NUMERIC NOT NULL,
      exit_price NUMERIC,
      pnl_pct NUMERIC,
      status VARCHAR(10) NOT NULL DEFAULT 'OPEN',
      opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      closed_at TIMESTAMP WITH TIME ZONE
    );

    CREATE INDEX IF NOT EXISTS copy_trader_trades_idx
      ON copy_trader_trades (trader_id, opened_at DESC);
    CREATE INDEX IF NOT EXISTS copy_trader_trades_open_idx
      ON copy_trader_trades (status) WHERE status = 'OPEN';

    /* A follower's standing instruction to copy a leader. */
    CREATE TABLE IF NOT EXISTS copy_subscriptions (
      id BIGSERIAL PRIMARY KEY,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      trader_id INTEGER NOT NULL REFERENCES copy_traders(id) ON DELETE CASCADE,
      allocated NUMERIC NOT NULL,
      quote_asset VARCHAR(10) NOT NULL DEFAULT 'USDT',
      stop_loss_pct NUMERIC,
      realized_pnl NUMERIC NOT NULL DEFAULT 0,
      fees_paid NUMERIC NOT NULL DEFAULT 0,
      status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      stopped_at TIMESTAMP WITH TIME ZONE
    );

    -- One live subscription per follower per leader; stopped ones may repeat.
    CREATE UNIQUE INDEX IF NOT EXISTS copy_subscriptions_active_idx
      ON copy_subscriptions (follower_id, trader_id) WHERE status = 'ACTIVE';

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'copy_subscriptions_alloc_check') THEN
        ALTER TABLE copy_subscriptions ADD CONSTRAINT copy_subscriptions_alloc_check
          CHECK (allocated > 0);
      END IF;
    END $$;

    /*
     * One follower's replication of one leader trade.
     *
     * Money actually moved for these: each row corresponds to real spot orders
     * and real ledger entries, which is why entry and exit are stored in full
     * rather than derived — a follower must be able to see exactly what was
     * bought, at what price, and what it returned.
     */
    CREATE TABLE IF NOT EXISTS copy_positions (
      id BIGSERIAL PRIMARY KEY,
      subscription_id BIGINT NOT NULL REFERENCES copy_subscriptions(id) ON DELETE CASCADE,
      trader_trade_id BIGINT NOT NULL REFERENCES copy_trader_trades(id) ON DELETE CASCADE,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pair VARCHAR(20) NOT NULL,
      base_asset VARCHAR(10) NOT NULL,
      quote_asset VARCHAR(10) NOT NULL,
      quantity NUMERIC NOT NULL,
      entry_price NUMERIC NOT NULL,
      quote_spent NUMERIC NOT NULL,
      exit_price NUMERIC,
      quote_returned NUMERIC,
      pnl NUMERIC,
      profit_share_fee NUMERIC NOT NULL DEFAULT 0,
      status VARCHAR(10) NOT NULL DEFAULT 'OPEN',
      opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      closed_at TIMESTAMP WITH TIME ZONE
    );

    CREATE INDEX IF NOT EXISTS copy_positions_follower_idx
      ON copy_positions (follower_id, opened_at DESC);
    -- Guarantees one follower cannot be replicated twice onto the same leader trade.
    CREATE UNIQUE INDEX IF NOT EXISTS copy_positions_unique_idx
      ON copy_positions (subscription_id, trader_trade_id);

    /*
     * Append-only record of every balance movement.
     *
     * wallets.balance is the fast read, but it is a running total and a running
     * total alone cannot answer "why is this number what it is". Every credit and
     * debit writes a row here inside the same transaction, so any balance can be
     * reconciled against its history. Rows are never updated or deleted.
     */
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      asset_symbol VARCHAR(10) NOT NULL,
      delta NUMERIC NOT NULL,
      balance_after NUMERIC NOT NULL,
      reason VARCHAR(40) NOT NULL,
      ref_type VARCHAR(20),
      ref_id BIGINT,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS ledger_entries_user_idx
      ON ledger_entries (user_id, created_at DESC);

    /*
     * Spot orders.
     *
     * Market orders are written already FILLED. Limit orders rest as OPEN with
     * funds locked until the market crosses their price or the user cancels.
     */
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pair VARCHAR(20) NOT NULL,
      base_asset VARCHAR(10) NOT NULL,
      quote_asset VARCHAR(10) NOT NULL,
      side VARCHAR(4) NOT NULL,
      type VARCHAR(10) NOT NULL,
      limit_price NUMERIC,
      amount NUMERIC NOT NULL,
      fill_price NUMERIC,
      fee NUMERIC NOT NULL DEFAULT 0,
      fee_asset VARCHAR(10),
      locked_asset VARCHAR(10),
      locked_amount NUMERIC NOT NULL DEFAULT 0,
      status VARCHAR(12) NOT NULL DEFAULT 'OPEN',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC);
    -- Drives the resting-order sweep, which only ever looks at OPEN rows.
    CREATE INDEX IF NOT EXISTS orders_open_idx ON orders (status, pair) WHERE status = 'OPEN';

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_side_check') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_side_check CHECK (side IN ('buy', 'sell'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_type_check') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_type_check CHECK (type IN ('market', 'limit'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_status_check
          CHECK (status IN ('OPEN', 'FILLED', 'CANCELLED', 'REJECTED'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_amount_positive') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_amount_positive CHECK (amount > 0);
      END IF;
    END $$;

    /* ================= INTERNAL TRANSFERS ================= */
    CREATE TABLE IF NOT EXISTS internal_transfers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      asset VARCHAR(10) NOT NULL,
      amount NUMERIC NOT NULL,
      from_wallet VARCHAR(20) NOT NULL,
      to_wallet VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'COMPLETED',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS internal_transfers_user_idx ON internal_transfers (user_id, created_at DESC);

    /* ================= FUTURES POSITIONS ================= */
    CREATE TABLE IF NOT EXISTS futures_positions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      market_symbol VARCHAR(20) NOT NULL,
      side VARCHAR(10) NOT NULL,
      margin_mode VARCHAR(20) NOT NULL DEFAULT 'cross',
      leverage NUMERIC NOT NULL DEFAULT 1,
      size NUMERIC NOT NULL DEFAULT 0,
      margin NUMERIC NOT NULL DEFAULT 0,
      entry_price NUMERIC NOT NULL,
      liquidation_price NUMERIC,
      status VARCHAR(20) DEFAULT 'OPEN',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS futures_positions_user_idx ON futures_positions (user_id, status);

    /*
     * Admin-managed trading directory — separate from mockData.ts's client-side
     * price feed. This table is what the Market Controls admin tab lists,
     * edits and toggles; it governs *availability* (spot/futures/copy/demo,
     * status, order limits) per symbol rather than live pricing.
     */
    CREATE TABLE IF NOT EXISTS market_assets (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      symbol VARCHAR(20) NOT NULL UNIQUE,
      category VARCHAR(20) DEFAULT 'Crypto',
      description TEXT,
      status VARCHAR(20) DEFAULT 'Active',
      spot_available BOOLEAN DEFAULT true,
      futures_available BOOLEAN DEFAULT true,
      copy_trading_available BOOLEAN DEFAULT true,
      demo_available BOOLEAN DEFAULT true,
      min_order NUMERIC DEFAULT 10,
      max_order NUMERIC DEFAULT 1000000,
      trading_fee VARCHAR(20) DEFAULT '0.02%',
      leverage_limits VARCHAR(20) DEFAULT '100x',
      price_precision INTEGER DEFAULT 2,
      qty_precision INTEGER DEFAULT 4,
      is_featured BOOLEAN DEFAULT false,
      is_trending BOOLEAN DEFAULT false,
      is_new_listing BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS market_assets_category_idx ON market_assets (category, status);

  `;

  try {
    await pool.query(queryText);
    console.log('Successfully created tables.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
};

createTables();
