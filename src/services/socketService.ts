import { io, Socket } from 'socket.io-client';

// Connect to the backend URL we just configured
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'], // Force WebSockets instead of HTTP long-polling
      });

      this.socket.on('connect', () => {
        console.log('🟢 Connected to live market data:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 Disconnected from market data');
      });
    }
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