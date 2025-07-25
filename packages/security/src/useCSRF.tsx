/**
 * 🔐 REACT HOOK PARA PROTECCIÓN CSRF
 *
 * Hook personalizado para manejar tokens CSRF en el frontend
 */

import { useCallback, useEffect, useState } from 'react';

interface CSRFTokenResponse {
  csrfToken: string;
  expiresIn: number;
  usage: {
    header: string;
    body: string;
    query: string;
  };
}

interface CSRFError {
  error: string;
  message: string;
  code: string;
}

interface UseCSRFReturn {
  csrfToken: string | null;
  isLoading: boolean;
  error: CSRFError | null;
  refreshToken: () => Promise<void>;
  getHeaders: () => Record<string, string>;
  isTokenValid: () => boolean;
  timeUntilExpiry: number;
}

/**
 * Hook para gestión de tokens CSRF
 */
export function useCSRF(options?: {
  autoRefresh?: boolean;
  refreshBeforeExpiry?: number; // milisegundos antes de expirar
}): UseCSRFReturn {
  const {
    autoRefresh = true,
    refreshBeforeExpiry = 5 * 60 * 1000, // 5 minutos por defecto
  } = options || {};

  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CSRFError | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number>(0);

  /**
   * Obtener nuevo token CSRF del servidor
   */
  const fetchCSRFToken = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CSRFTokenResponse = await response.json();

      setCSRFToken(data.csrfToken);
      setTokenExpiry(Date.now() + data.expiresIn * 1000);

      console.log('✅ CSRF token obtenido exitosamente');
    } catch (err) {
      const errorData: CSRFError = {
        error: 'CSRF_TOKEN_FETCH_FAILED',
        message: err instanceof Error ? err.message : 'Error desconocido',
        code: 'FETCH_ERROR',
      };

      setError(errorData);
      console.error('❌ Error obteniendo token CSRF:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar si el token es válido
   */
  const isTokenValid = useCallback((): boolean => {
    if (!csrfToken || !tokenExpiry) return false;
    return Date.now() < tokenExpiry;
  }, [csrfToken, tokenExpiry]);

  /**
   * Tiempo hasta que expire el token
   */
  const timeUntilExpiry = tokenExpiry
    ? Math.max(0, tokenExpiry - Date.now())
    : 0;

  /**
   * Obtener headers para requests
   */
  const getHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (csrfToken && isTokenValid()) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }, [csrfToken, isTokenValid]);

  /**
   * Refresh manual del token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    await fetchCSRFToken();
  }, [fetchCSRFToken]);

  // Obtener token inicial
  useEffect(() => {
    fetchCSRFToken();
  }, [fetchCSRFToken]);

  // Auto-refresh del token
  useEffect(() => {
    if (!autoRefresh || !tokenExpiry) return;

    const refreshTime = tokenExpiry - refreshBeforeExpiry;
    const now = Date.now();

    if (refreshTime <= now) {
      // Token expira pronto, renovar inmediatamente
      fetchCSRFToken();
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchCSRFToken();
    }, refreshTime - now);

    return () => clearTimeout(timeoutId);
  }, [autoRefresh, tokenExpiry, refreshBeforeExpiry, fetchCSRFToken]);

  return {
    csrfToken,
    isLoading,
    error,
    refreshToken,
    getHeaders,
    isTokenValid,
    timeUntilExpiry,
  };
}

/**
 * Hook para hacer requests seguros con CSRF
 */
export function useSecureFetch() {
  const { getHeaders, isTokenValid, refreshToken } = useCSRF();

  const secureFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      // Verificar si necesitamos token CSRF para este método
      const method = options?.method?.toUpperCase() || 'GET';
      const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

      if (needsCSRF && !isTokenValid()) {
        console.warn('🔄 Token CSRF inválido o expirado, renovando...');
        await refreshToken();
      }

      const csrfHeaders = needsCSRF ? getHeaders() : {};

      const secureOptions: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
          ...csrfHeaders,
        },
      };

      return fetch(url, secureOptions);
    },
    [getHeaders, isTokenValid, refreshToken]
  );

  return { secureFetch };
}

/**
 * Context para compartir CSRF token globalmente
 */
import { createContext, ReactNode, useContext } from 'react';

interface CSRFContextType {
  csrfToken: string | null;
  getHeaders: () => Record<string, string>;
  refreshToken: () => Promise<void>;
  isTokenValid: () => boolean;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export function CSRFProvider({ children }: { children: ReactNode }) {
  const csrf = useCSRF();

  const contextValue: CSRFContextType = {
    csrfToken: csrf.csrfToken,
    getHeaders: csrf.getHeaders,
    refreshToken: csrf.refreshToken,
    isTokenValid: csrf.isTokenValid,
  };

  return (
    <CSRFContext.Provider value={contextValue}>{children}</CSRFContext.Provider>
  );
}

export function useCSRFContext(): CSRFContextType {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRFContext debe usarse dentro de CSRFProvider');
  }
  return context;
}

/**
 * Componente para mostrar estado del token CSRF (desarrollo)
 */
export function CSRFDebugInfo() {
  const { csrfToken, isLoading, error, timeUntilExpiry, isTokenValid } =
    useCSRF();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#f0f0f0',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 9999,
      }}
    >
      <div>
        <strong>🔐 CSRF Debug</strong>
      </div>
      <div>Token: {csrfToken ? `${csrfToken.substring(0, 8)}...` : 'None'}</div>
      <div>Valid: {isTokenValid() ? '✅' : '❌'}</div>
      <div>Loading: {isLoading ? '🔄' : '✅'}</div>
      <div>Expires in: {Math.round(timeUntilExpiry / 1000)}s</div>
      {error && <div style={{ color: 'red' }}>Error: {error.code}</div>}
    </div>
  );
}
