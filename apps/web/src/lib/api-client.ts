import { httpClient } from '../../services/httpClient';
import { ApiError, NetworkError, ValidationError } from './api-error';
import { AxiosError, AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * HTTP Client wrapper around axios
 * Provides standardized error handling and response unwrapping
 */
class ApiClient {
  /**
   * Perform a GET request
   * @param url - Request URL
   * @param config - Optional axios request configuration
   * @returns Promise containing the response data
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await httpClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Perform a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional axios request configuration
   * @returns Promise containing the response data
   */
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await httpClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Perform a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional axios request configuration
   * @returns Promise containing the response data
   */
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await httpClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Perform a DELETE request
   * @param url - Request URL
   * @param config - Optional axios request configuration
   * @returns Promise containing the response data
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await httpClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add idempotency key to request configuration
   * @param config - Optional existing configuration
   * @param key - Optional specific idempotency key (generates random UUID if not provided)
   * @returns Configuration object with idempotency key header
   */
  withIdempotency(
    config: AxiosRequestConfig = {},
    key?: string
  ): AxiosRequestConfig {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Idempotency-Key': key || this.generateUUID(),
      },
    };
  }

  /**
   * Generate a random UUID v4
   * @returns UUID string
   */
  private generateUUID(): string {
    return crypto.randomUUID ? crypto.randomUUID() : this.fallbackUUID();
  }

  /**
   * Fallback UUID generation for environments without crypto.randomUUID
   * @returns UUID string
   */
  private fallbackUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Handle API errors and convert to custom error types
   * @param error - Axios error
   * @returns Appropriate error instance
   */
  private handleError(error: any): Error {
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return new NetworkError('Error de conexión de red');
    }

    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as any;

    if (status === 400 && data?.errors) {
      return new ValidationError('Datos de entrada inválidos', data.errors);
    }

    return new ApiError(
      data?.error || data?.message || 'Error desconocido',
      status || 500,
      data?.code,
      data?.details
    );
  }
}

export const apiClient = new ApiClient();
