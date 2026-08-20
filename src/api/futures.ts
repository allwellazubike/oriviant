import { apiClient } from './client';

export interface OpenFuturesPositionPayload {
  market_symbol: string; // e.g., "BTC/USDT"
  side: 'LONG' | 'SHORT';
  margin_mode: 'ISOLATED' | 'CROSS';
  leverage: number;       // e.g., 10, 20, 50
  collateral_amount: number; // USDT margin supplied
}

export const futuresApi = {
  openPosition: async (payload: OpenFuturesPositionPayload) => {
    return apiClient<{ success: boolean; message: string; position?: any }>('/futures/position', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getPositions: async () => {
    return apiClient<{ success: boolean; data: any[] }>('/futures/positions', {
      method: 'GET',
    });
  },

  closePosition: async (positionId: number | string) => {
    return apiClient<{ success: boolean; message: string }>(`/futures/positions/${positionId}/close`, {
      method: 'POST',
    });
  },

  updateLeverage: async (marketSymbol: string, leverage: number) => {
    return apiClient<{ success: boolean; message: string }>('/futures/leverage', {
      method: 'POST',
      body: JSON.stringify({ market_symbol: marketSymbol, leverage }),
    });
  }
};