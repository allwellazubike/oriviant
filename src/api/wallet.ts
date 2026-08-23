import { apiClient } from './client';

export interface WalletAssetResponse {
  asset_symbol: string;
  balance: number;
  locked: number;
  available: number;
  updated_at?: string;
}

export interface LedgerEntry {
  id: number;
  asset_symbol: string;
  delta: number;
  balance_after: number;
  reason: string;
  ref_type: string;
  ref_id?: number;
  metadata?: any;
  created_at: string;
}

export const walletApi = {
  getWallets: async () => {
    return apiClient<{ success: boolean; wallets: WalletAssetResponse[] }>('/wallets', {
      method: 'GET',
    });
  },

  getLedger: async (assetSymbol?: string) => {
    const query = assetSymbol ? `?asset=${assetSymbol}` : '';
    return apiClient<{ success: boolean; ledger: LedgerEntry[] }>(`/wallets/ledger${query}`, {
      method: 'GET',
    });
  },

  // NEW: The actual API call to move funds between Spot, Futures, and Funding
  transferFunds: async (asset: string, amount: number, fromWallet: string, toWallet: string) => {
    return apiClient<{ success: boolean; message: string }>('/wallets/transfer', {
      method: 'POST',
      body: JSON.stringify({ asset, amount, from_type: fromWallet, to_type: toWallet })
    });
  }
};