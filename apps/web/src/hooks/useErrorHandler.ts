import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError, NetworkError } from '@/lib/api-error';
import { useCallback, useRef } from 'react';

export function useErrorHandler() {
  const router = useRouter();
  const redirectingRef = useRef(false); // Prevenir loops de redirección

  const handleError = useCallback(
    (error: unknown, _context?: string) => {
      // Lógica principal de manejo
      if (error instanceof ApiError) {
        switch (error.statusCode) {
          case 401:
            handleAuthError();
            return;
          case 403:
            toast.error('No tienes permisos para realizar esta acción');
            return;
          case 404:
            toast.error('Recurso no encontrado');
            return;
          case 422:
          case 400:
            if (error.details) {
              toast.error('Errores de validación', {
                description: Array.isArray(error.details)
                  ? error.details.join(', ')
                  : JSON.stringify(error.details),
              });
            } else {
              toast.error(error.message);
            }
            return;
          default:
            if (error.isServerError()) {
              toast.error('Error del servidor. Intenta de nuevo más tarde');
            } else {
              toast.error(error.message);
            }
            return;
        }
      }

      if (error instanceof NetworkError) {
        toast.error('Error de conexión. Verifica tu internet');
        return;
      }

      // Error genérico
      const message =
        error instanceof Error ? error.message : 'Error inesperado';
      toast.error(message);
    },
    [router]
  );

  const handleAuthError = useCallback(() => {
    if (redirectingRef.current) return;

    redirectingRef.current = true;
    toast.error('Sesión expirada. Redirigiendo al login...');

    // Esperar 1 segundo antes de redirigir
    setTimeout(() => {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      redirectingRef.current = false;
    }, 1000);
  }, [router]);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  return { handleError, handleAuthError, showError, showSuccess, showWarning };
}
