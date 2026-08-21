import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import tradingRoutes from './routes/tradingRoutes.js';
import copyTradingRoutes from './routes/copyTradingRoutes.js';
import futuresRoutes from './routes/futuresRoutes.js';
import { processRestingOrders } from './services/tradingService.js';
import { tickDemoTraders } from './services/demoTraderEngine.js';
import pool from './config/db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Deposit proofs arrive as base64 data URIs, which blow straight past the 100kb
// default. uploadService caps the actual file well below this.
app.use(express.json({ limit: '8mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/copy', copyTradingRoutes);
app.use('/api/futures', futuresRoutes);
app.use('/api/transfers', transferRoutes);

// Database connection check
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Oriviant API' });
});

/**
 * Resting limit orders are filled by this sweep rather than by a matching
 * engine: there is no counterparty book, so orders fill against the live market
 * price once it reaches them.
 *
 * Guarded by a running flag because a slow sweep must not overlap itself and
 * try to fill the same order twice.
 */
const ORDER_SWEEP_INTERVAL_MS = 5000;
let sweepRunning = false;

setInterval(async () => {
  if (sweepRunning) return;
  sweepRunning = true;
  try {
    const fills = await processRestingOrders();
    if (fills > 0) console.log(`Filled ${fills} resting order(s).`);
  } catch (err) {
    console.error('Resting order sweep failed:', (err as Error).message);
  } finally {
    sweepRunning = false;
  }
}, ORDER_SWEEP_INTERVAL_MS);

/**
 * Demo lead traders act on their own schedule.
 *
 * Runs in-process rather than as an OS cron job so it needs no extra setup and
 * stops when the server does — there is no scenario where fabricated leaders
 * should keep trading against an API that is down. Same overlap guard as the
 * order sweep: a slow tick must not run twice and open the same position.
 *
 * Set DEMO_TRADERS=off in .env to disable without touching code.
 */
const DEMO_TICK_INTERVAL_MS = 60_000;
let demoTickRunning = false;

if (process.env.DEMO_TRADERS !== 'off') {
  setInterval(async () => {
    if (demoTickRunning) return;
    demoTickRunning = true;
    try {
      const { opened, closed } = await tickDemoTraders(DEMO_TICK_INTERVAL_MS);
      if (opened || closed) {
        console.log(`Demo traders: ${opened} opened, ${closed} closed.`);
      }
    } catch (err) {
      console.error('Demo trader tick failed:', (err as Error).message);
    } finally {
      demoTickRunning = false;
    }
  }, DEMO_TICK_INTERVAL_MS);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
