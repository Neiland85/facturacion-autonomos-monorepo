import { apiClient } from '@/lib/api-client';
import type { Company, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for creating or updating a company
 */
export interface UpsertCompanyRequest {
  name: string;
  cif: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  phone?: string;
  email?: string;
  website?: string;
  taxRegime?: string;
}

/**
 * Service for managing company information
 * Implements singleton pattern for consistent state management
 */
export class CompanyService {
  private static instance: CompanyService;
  private readonly baseEndpoint = '/api/companies';

  private constructor() {}

  /**
   * Get or create the singleton instance
   */
  static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  /**
   * Get the current user's company
   * @returns Promise containing the company
   */
  async getMyCompany(): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>(
      `${this.baseEndpoint}/me`
    );
    return response.data;
  }

  /**
   * Create a new company with idempotency key
   * @param data - Company data to create
   * @returns Promise containing the created company
   */
  async createCompany(data: UpsertCompanyRequest): Promise<Company> {
    const idempotencyKey = uuidv4();
    const response = await apiClient.post<ApiResponse<Company>>(
      this.baseEndpoint,
      data,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    return response.data;
  }

  /**
   * Update the current user's company with idempotency key
   * @param data - Company data to update
   * @returns Promise containing the updated company
   */
  async updateCompany(data: UpsertCompanyRequest): Promise<Company> {
    const idempotencyKey = uuidv4();
    const response = await apiClient.put<ApiResponse<Company>>(
      `${this.baseEndpoint}/me`,
      data,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    return response.data;
  }
}

/**
 * Singleton instance of CompanyService
 */
export const companyService = CompanyService.getInstance();
