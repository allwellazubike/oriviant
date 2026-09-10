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
import notificationRoutes from './routes/notificationRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
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

// 🔥 FIX: Placed CORS at the very top before rate limiters so preflight OPTIONS requests are handled properly
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost',
  'https://localhost',
  'capacitor://localhost',
  'https://oriviant-mu.vercel.app', 
  'https://oriviant-one.vercel.app',
  'https://oriviant-delta.vercel.app',
  process.env.FRONTEND_URL || 'https://oriviant-trades-website.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '8mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 2000, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

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
app.use('/api/academy', academyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/kyc', kycRoutes);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Oriviant API' });
});

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

const MARKET_TICK_INTERVAL_MS = 5000;

setInterval(async () => {
  try {
    const { quotes } = await getQuotes();
    for (const [symbol, priceData] of Object.entries(quotes)) {
      websocketService.broadcastMarketTick(symbol, priceData);
    }
  } catch (err) {
    console.error('Market tick broadcast failed:', (err as Error).message);
  }
}, MARKET_TICK_INTERVAL_MS);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.'
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});