import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import tradingRoutes from './routes/tradingRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import copyTradingRoutes from './routes/copyTradingRoutes.js';
import futuresRoutes from './routes/futuresRoutes.js';
import { processRestingOrders } from './services/tradingService.js';
import { tickDemoTraders } from './services/demoTraderEngine.js';
import { websocketService } from './services/websocketService.js';
import { getQuotes } from './services/marketDataService.js';
import pool from './config/db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security: Trust reverse proxy (Critical for accurate IP-based rate limiting on Render/Heroku/AWS)
app.set('trust proxy', 1);

// Wrap Express in a native Node HTTP server
const httpServer = createServer(app);

// Initialize WebSockets
websocketService.init(httpServer);

// 2. Security: Strict CORS Configuration with Environment Fallbacks
const allowedOrigins = [
  'http://localhost:5173', // Local Vite development
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://oriviant-trades-website.vercel.app' // Dynamic production domain
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) or allowed domains
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Deposit proofs arrive as base64 data URIs, which blow straight past the 100kb
// default. uploadService caps the actual file well below this.
app.use(express.json({ limit: '8mb' }));

/// 3. Security: General API Rate Limiting (Increased max requests for active testing)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased from 200 to prevent 429 throttling during polling and testing
  standardHeaders: true, 
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// 4. Security: Strict Auth Rate Limiting (Protects against brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login/register attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

// Apply rate limiters to routes
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/copy', copyTradingRoutes);
<<<<<<< HEAD
app.use('/api/futures', futuresRoutes);
app.use('/api/transfers', transferRoutes);
=======
app.use('/api/academy', academyRoutes);
>>>>>>> 96e8d059d1f94e6fa080419cd20cce8e46294503

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

/**
 * Real-time Market Data Broadcaster
 * 
 * Fetches the latest cached prices and broadcasts them to any clients 
 * subscribed to specific market rooms via WebSockets.
 */
const MARKET_TICK_INTERVAL_MS = 5000;

setInterval(async () => {
  try {
    const { quotes } = await getQuotes();
    
    // Broadcast each symbol to its specific socket room
    for (const [symbol, priceData] of Object.entries(quotes)) {
      websocketService.broadcastMarketTick(symbol, priceData);
    }
  } catch (err) {
    console.error('Market tick broadcast failed:', (err as Error).message);
  }
}, MARKET_TICK_INTERVAL_MS);

// 5. Security: Centralized Error Handler (Must be the very last middleware before listen)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.' // Sanitized output so no stack traces leak
  });
});

// Replace app.listen with httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});