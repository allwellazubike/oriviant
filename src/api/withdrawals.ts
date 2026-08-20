import { apiClient } from './client';

export interface WithdrawalRequestPayload {
  asset: string;
  amount: number;
  network: string;
  recipient_address: string;
  nickname?: string;
}

export interface WithdrawalRecordResponse {
  id: number;
  asset: string;
  amount: number;
  fee: number;
  receive_amount: number;
  network: string;
  recipient_address: string;
  address_nickname?: string;
  status: string;
  tx_hash?: string;
  notes?: string;
  created_at: string;
}

export const withdrawalApi = {
  requestWithdrawal: async (payload: WithdrawalRequestPayload) => {
    return apiClient<{ success: boolean; message: string; withdrawal: WithdrawalRecordResponse }>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getWithdrawals: async () => {
    return apiClient<{ success: boolean; withdrawals: WithdrawalRecordResponse[] }>('/withdrawals', {
      method: 'GET',
    });
  },
};