import { apiClient } from './client';

export interface OrderPayload {
  market_symbol: string; // e.g., "BTC/USDT"
  type: 'MARKET' | 'LIMIT';
  side: 'BUY' | 'SELL';
  amount: number;        // Quantity of the base asset (e.g., BTC)
  price?: number;        // Required for LIMIT orders
}

export const tradingApi = {
  placeOrder: async (payload: OrderPayload) => {
    return apiClient<{ success: boolean; message: string; order?: any; trade?: any }>('/trading/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getOpenOrders: async (marketSymbol?: string) => {
    const query = marketSymbol ? `?market=${marketSymbol}` : '';
    return apiClient<{ success: boolean; data: any[] }>(`/trading/orders${query}`, {
      method: 'GET',
    });
  },

  cancelOrder: async (orderId: number | string) => {
    return apiClient<{ success: boolean; message: string }>(`/trading/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  },

  getTradeHistory: async (marketSymbol?: string) => {
    const query = marketSymbol ? `?market=${marketSymbol}` : '';
    return apiClient<{ success: boolean; data: any[] }>(`/trading/history${query}`, {
      method: 'GET',
    });
  }
};