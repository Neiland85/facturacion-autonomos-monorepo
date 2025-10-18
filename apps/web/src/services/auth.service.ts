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

/**
 * Service for authentication and user management
 * Implements singleton pattern for consistent state management
 */
export class AuthService {
  private static instance: AuthService;
  private readonly baseEndpoint = '/auth';

  private constructor() {}

  /**
   * Get or create the singleton instance
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Log in a user
   * @param email - User email address
   * @param password - User password
   * @param remember - Whether to remember the user
   * @returns Promise containing auth response with user data
   */
  async login(
    email: string,
    password: string,
    remember?: boolean
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseEndpoint}/login`,
      {
        email,
        password,
        remember,
      }
    );
    return response;
  }

  /**
   * Register a new user
   * @param data - Registration data
   * @returns Promise containing auth response with user data
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseEndpoint}/register`,
      data
    );
    return response;
  }

  /**
   * Log out the current user
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await apiClient.post(`${this.baseEndpoint}/logout`);
  }

  /**
   * Get the current logged-in user
   * @returns Promise containing the current user data
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<{ user: AuthUser }>(
      `${this.baseEndpoint}/me`
    );
    return response.user;
  }

  /**
   * Refresh the authentication token
   * @returns Promise that resolves when token is refreshed
   */
  async refreshToken(): Promise<void> {
    await apiClient.post(`${this.baseEndpoint}/refresh`);
  }

  /**
   * Verify two-factor authentication
   * @param token - 2FA token from authenticator app
   * @returns Promise containing auth response
   */
  async verify2FA(token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.baseEndpoint}/2fa/verify`,
      {
        token,
      }
    );
    return response;
  }

  /**
   * Request a password reset email
   * @param email - User email address
   * @returns Promise that resolves when reset email is sent
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(`${this.baseEndpoint}/forgot-password`, { email });
  }

  /**
   * Reset password with reset token
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @returns Promise that resolves when password is reset
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.baseEndpoint}/reset-password`, {
      token,
      newPassword,
    });
  }

  /**
   * Verify email address with verification token
   * @param token - Email verification token
   * @returns Promise that resolves when email is verified
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(`${this.baseEndpoint}/verify-email`, { token });
  }
}

/**
 * Singleton instance of AuthService
 */
export const authService = AuthService.getInstance();
