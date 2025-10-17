'use client';

import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  reset,
  title = 'Algo salió mal',
  description = 'Ha ocurrido un error inesperado',
  showDetails = false,
}: ErrorFallbackProps) {
  const router = useRouter();

  const handleReset = () => {
    if (reset) {
      reset();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div
        className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
        role="alert"
      >
        <div className="mb-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{description}</p>
        </div>

        {showDetails && process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md text-left">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Detalles del error:
            </p>
            <p className="text-sm text-gray-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Intentar de nuevo
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
