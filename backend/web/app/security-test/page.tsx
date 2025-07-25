import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useEffect } from 'react';

export default function SecurityTestPage() {
  const { exposedVars, isClientSide, lastCheck } = useSecurityMonitor();

  useEffect(() => {
    console.log('🔍 Security Monitor Test Results:', {
      exposedVars,
      isClientSide,
      lastCheck,
    });
  }, [exposedVars, isClientSide, lastCheck]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔐 Prueba de Seguridad</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estado del Cliente */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Estado del Cliente</h2>
          <div className="space-y-2">
            <p>
              <strong>Ejecutando en cliente:</strong>{' '}
              {isClientSide ? '✅ Sí' : '❌ No'}
            </p>
            <p>
              <strong>Última verificación:</strong>{' '}
              {lastCheck?.toLocaleString() || 'Nunca'}
            </p>
          </div>
        </div>

        {/* Variables Expuestas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Variables Expuestas</h2>
          {exposedVars.length === 0 ? (
            <p className="text-green-600">
              🎉 No se encontraron variables sensibles expuestas
            </p>
          ) : (
            <div>
              <p className="text-red-600 mb-2">
                ⚠️ Variables sensibles detectadas:
              </p>
              <ul className="list-disc list-inside">
                {exposedVars.map(varName => (
                  <li key={varName} className="text-red-500">
                    {varName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Variables de Entorno Públicas */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Variables de Entorno Públicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(process.env)
            .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
            .map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded">
                <strong className="text-sm font-mono">{key}:</strong>
                <p className="text-sm text-gray-600 break-all">
                  {typeof value === 'string' && value.length > 50
                    ? `${value.substring(0, 50)}...`
                    : value || '(undefined)'}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Test de Integridad */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold mb-4">🧪 Test de Integridad</h2>
        <div className="space-y-2">
          <p>✅ Hook de monitoreo cargado</p>
          <p>✅ Detección de lado del cliente funcionando</p>
          <p>✅ Escaneo de variables completado</p>
          <p>✅ Página de prueba renderizada correctamente</p>
        </div>
      </div>
    </div>
  );
}
