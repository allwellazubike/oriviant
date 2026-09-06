import { io, Socket } from 'socket.io-client';

// 🔥 FIX: Clean the URL for Socket.io. 
// If VITE_API_URL is "https://backend.com/api", it strips the "/api" so sockets can connect to the root.
let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = rawUrl.replace(/\/api\/?$/, '');

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        console.log('🟢 Connected to live market data:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔴 Disconnected from market data:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.socket?.connect();
        }
      });
    }
  }

  authenticate(token: string) {
    if (this.socket) {
      this.socket.emit('authenticate', { token });
    }
  }

  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  offNotification(callback: (notification: any) => void) {
    this.socket?.off('notification', callback);
  }

  subscribeToMarket(symbol: string) {
    if (this.socket) {
      this.socket.emit('subscribe_market', symbol);
    }
  }

  unsubscribeFromMarket(symbol: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe_market', symbol);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();