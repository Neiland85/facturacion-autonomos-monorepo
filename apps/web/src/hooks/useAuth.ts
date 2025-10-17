'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';
import { authService } from '@/services/auth.service';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Verificar autenticación inicial
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(
    async (email: string, password: string, remember = false) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.login(email, password, remember);

        if (response.success && response.user) {
          setUser(response.user);
          router.push('/dashboard');
        } else {
          throw new Error(response.message ?? 'Error en el login');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error en el login';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Register
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.register({ email, password, name });

        if (response.success && response.user) {
          setUser(response.user);
          router.push('/dashboard');
        } else {
          throw new Error(response.message ?? 'Error en el registro');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error en el registro';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      // Forzar logout del lado cliente aunque falle el servidor
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
      throw err;
    }
  }, []);

  // Verificar auth al montar el componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
}
