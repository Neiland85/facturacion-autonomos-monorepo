import { apiClient } from '@/lib/api-client';
import type { DashboardData, ApiResponse } from '@/types';

/**
 * Service for retrieving dashboard statistics and summary data
 * Implements singleton pattern for consistent state management
 */
export class DashboardService {
  private static instance: DashboardService;
  private readonly baseEndpoint = '/api/invoices';

  private constructor() {}

  /**
   * Get or create the singleton instance
   */
  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Get dashboard summary statistics
   * @returns Promise containing dashboard data with statistics
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      `${this.baseEndpoint}/stats/summary`
    );
    return response.data;
  }
}

/**
 * Singleton instance of DashboardService
 */
export const dashboardService = DashboardService.getInstance();
