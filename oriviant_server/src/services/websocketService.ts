import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const websocketService = {
  init: (server: HttpServer) => {
    // Initialize Socket.io with permissive CORS (we will lock this down in Phase 14)
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
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

      // 2. Private User Rooms: Clients authenticate to receive private balance/order updates
      socket.on('authenticate', (userId: string) => {
        // In a production environment, you would verify a JWT here before joining
        socket.join(`user_${userId}`);
        console.log(`Client ${socket.id} authenticated for private room user_${userId}`);
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

  // Pushes a private notification directly to a specific user
  notifyUserBalance: (userId: number, payload: { asset: string; balance: number }) => {
    if (io) {
      io.to(`user_${userId.toString()}`).emit('balance_update', payload);
    }
  }
};