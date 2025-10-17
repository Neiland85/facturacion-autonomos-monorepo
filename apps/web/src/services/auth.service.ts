import { apiClient } from '@/lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  twoFactorEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: AuthUser;
  requiresTwoFactor?: boolean;
}

export interface AuthError {
  success: false;
  error: string;
  code?: string;
}

class AuthService {
  async login(
    email: string,
    password: string,
    remember?: boolean
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
      remember,
    });
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
    return response.user;
  }

  async refreshToken(): Promise<void> {
    await apiClient.post('/auth/refresh');
  }

  async verify2FA(token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/2fa/verify', {
      token,
    });
    return response;
  }
}

export const authService = new AuthService();
