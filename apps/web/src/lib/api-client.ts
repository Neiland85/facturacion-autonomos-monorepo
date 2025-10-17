import { httpClient } from '../../services/httpClient';
import { ApiError, NetworkError, ValidationError } from './api-error';
import { AxiosError } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ApiClient {
  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await httpClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await httpClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await httpClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await httpClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

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
