/**
 * @fileoverview Auth service client for the web application
 * @version 1.0.0
 */

import { AuthService, DEFAULT_API_CONFIG } from './index';

// Create and export a singleton instance of AuthService
export const authService = new AuthService({
  ...DEFAULT_API_CONFIG,
  baseUrl: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3003'
});