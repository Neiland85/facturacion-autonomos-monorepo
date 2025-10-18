import { apiClient } from '@/lib/api-client';
import type { Client, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for client filtering parameters
 */
export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Interface for creating a new client
 */
export interface CreateClientRequest {
  name: string;
  nifCif: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  phone?: string;
  email?: string;
}

/**
 * Interface for updating a client
 */
export type UpdateClientRequest = Partial<CreateClientRequest>;

/**
 * Interface for paginated responses
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Service for managing clients
 * Implements singleton pattern for consistent state management
 */
export class ClientService {
  private static instance: ClientService;
  private readonly baseEndpoint = '/api/clients';

  private constructor() {}

  /**
   * Get or create the singleton instance
   */
  static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  /**
   * Get all clients with optional filtering and pagination
   * @param filters - Optional filters for clients
   * @returns Promise containing paginated clients
   */
  async getClients(
    filters?: ClientFilters
  ): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `${this.baseEndpoint}?${queryString}`
      : this.baseEndpoint;

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Client>>>(
      endpoint
    );

    return response.data;
  }

  /**
   * Get a single client by ID
   * @param id - Client ID
   * @returns Promise containing the client
   */
  async getClient(id: string): Promise<Client> {
    const response = await apiClient.get<ApiResponse<Client>>(
      `${this.baseEndpoint}/${id}`
    );
    return response.data;
  }

  /**
   * Create a new client with idempotency key
   * @param data - Client data to create
   * @returns Promise containing the created client
   */
  async createClient(data: CreateClientRequest): Promise<Client> {
    const idempotencyKey = uuidv4();
    const response = await apiClient.post<ApiResponse<Client>>(
      this.baseEndpoint,
      data,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    return response.data;
  }

  /**
   * Update an existing client with idempotency key
   * @param id - Client ID
   * @param data - Partial client data to update
   * @returns Promise containing the updated client
   */
  async updateClient(
    id: string,
    data: UpdateClientRequest
  ): Promise<Client> {
    const idempotencyKey = uuidv4();
    const response = await apiClient.put<ApiResponse<Client>>(
      `${this.baseEndpoint}/${id}`,
      data,
      {
        headers: { 'Idempotency-Key': idempotencyKey },
      }
    );
    return response.data;
  }

  /**
   * Delete a client
   * @param id - Client ID
   * @returns Promise that resolves when deletion is complete
   */
  async deleteClient(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `${this.baseEndpoint}/${id}`
    );
  }
}

/**
 * Singleton instance of ClientService
 */
export const clientService = ClientService.getInstance();
