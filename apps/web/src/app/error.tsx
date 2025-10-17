'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error/ErrorFallback';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Route error:', error);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // reportError(error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Error en la página"
      description="Ha ocurrido un error al cargar esta página. Puedes intentar de nuevo o volver al inicio."
      showDetails={process.env.NODE_ENV === 'development'}
    />
  );
}
