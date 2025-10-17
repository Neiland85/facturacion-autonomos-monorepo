'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error/ErrorFallback';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
    // TODO: Send to error tracking service
  }, [error]);

  // IMPORTANTE: global-error.tsx reemplaza el root layout,
  // por lo que DEBE incluir <html> y <body>
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 antialiased">
        <ErrorFallback
          error={error}
          reset={reset}
          title="Error crítico"
          description="Ha ocurrido un error crítico en la aplicación. Por favor, recarga la página o contacta con soporte si el problema persiste."
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </body>
    </html>
  );
}
