import { apiClient } from './client';

export interface DepositOption {
  asset: string;
  networks: {
    network: string;
    depositAddress: string;
    requiredConfirmations: number;
  }[];
}

export interface DepositRequestPayload {
  asset: string;
  amount_expected: number;
  tx_hash: string;
  proof?: string;
  network?: string;
}

export interface DepositRecordResponse {
  id: number;
  asset: string;
  amount: number;
  network: string;
  tx_hash: string;
  status: string;
  created_at: string;
}

export const depositApi = {
  getDepositOptions: async () => {
    return apiClient<{ success: boolean; options: DepositOption[] }>('/deposits/options', {
      method: 'GET',
    });
  },

  submitDeposit: async (payload: DepositRequestPayload) => {
    return apiClient<{ success: boolean; message: string; deposit: DepositRecordResponse }>('/deposits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getDeposits: async () => {
    return apiClient<{ success: boolean; deposits: DepositRecordResponse[] }>('/deposits', {
      method: 'GET',
    });
  },
};