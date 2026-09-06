import { apiClient } from './client';

export interface Level1Payload {
  full_legal_name: string;
  date_of_birth: string;
  phone_number: string;
  residential_address: string;
  nationality: string;
}

export const kycApi = {
  submitLevel1: async (data: Level1Payload) => {
    return await apiClient<any>('/kyc/level1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submitLevel2: async (formData: FormData) => {
    return await apiClient<any>('/kyc/level2', {
      method: 'POST',
      body: formData,
    });
  },

  getStatus: async () => {
    return await apiClient<any>('/kyc/my-status');
  },
};