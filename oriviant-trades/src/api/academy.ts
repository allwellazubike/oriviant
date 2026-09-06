import { apiClient } from './client';
import { UserAcademyProgress } from '../types/academy';

export const academyApi = {
  /**
   * Fetches the user's saved academy progress from the database
   */
  getProgress: async (): Promise<{ success: boolean; data: UserAcademyProgress }> => {
    return await apiClient<{ success: boolean; data: UserAcademyProgress }>('/academy/progress');
  },

  /**
   * Saves the user's current progress to the database
   */
  saveProgress: async (progress: UserAcademyProgress): Promise<{ success: boolean; message: string }> => {
    return await apiClient<{ success: boolean; message: string }>('/academy/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }
};