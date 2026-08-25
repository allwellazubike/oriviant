import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

export const websocketService = {
  init: (server: HttpServer) => {
    // 🔥 FIX: Production-ready Socket configuration with Keep-Alives
    io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          process.env.FRONTEND_URL || 'https://oriviant-trades-website.vercel.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      },
      // Keep-alive settings to prevent Render/Heroku load balancers from dropping idle connections
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['polling', 'websocket']
    });

    io.on('connection', (socket: Socket) => {
      console.log(`⚡ WebSocket Client Connected: ${socket.id}`);

      // 1. Market Data Rooms: Clients can subscribe to specific symbol feeds
      socket.on('subscribe_market', (symbol: string) => {
        socket.join(`market_${symbol}`);
        console.log(`Client ${socket.id} subscribed to market_${symbol}`);
      });

      socket.on('unsubscribe_market', (symbol: string) => {
        socket.leave(`market_${symbol}`);
      });

      // 2. Private User Rooms: Securely authenticate clients using a JWT before granting access
      socket.on('authenticate', (payload: { token: string }) => {
        if (!payload || !payload.token) {
          console.warn(`Client ${socket.id} attempted to authenticate without a token`);
          socket.emit('auth_error', { message: 'Authentication token is required' });
          return;
        }

        try {
          // Verify the JWT mathematically instead of trusting client IDs
          const decoded = jwt.verify(payload.token, process.env.JWT_SECRET || 'fallback-secret-for-development') as { id: string | number };
          
          socket.join(`user_${decoded.id}`);
          console.log(`Client ${socket.id} authenticated securely for private room user_${decoded.id}`);
          socket.emit('auth_success', { message: 'Successfully subscribed to private channel' });
        } catch (err) {
          console.warn(`Client ${socket.id} failed JWT authentication`);
          socket.emit('auth_error', { message: 'Invalid or expired token' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔴 WebSocket Client Disconnected: ${socket.id}`);
      });
    });
  },

  // Broadcasts a price tick to everyone subscribed to that specific market
  broadcastMarketTick: (symbol: string, priceData: any) => {
    if (io) {
      io.to(`market_${symbol}`).emit('market_tick', priceData);
    }
  },

  // Pushes a private notification directly to a specific securely authenticated user
  notifyUserBalance: (userId: number, payload: { asset: string; balance: number }) => {
    if (io) {
      io.to(`user_${userId.toString()}`).emit('balance_update', payload);
    }
  },

  // Pushes a freshly created notification row straight to its owner, if connected.
  pushNotification: (userId: number, notification: any) => {
    if (io) {
      io.to(`user_${userId.toString()}`).emit('notification', notification);
    }
  }
};