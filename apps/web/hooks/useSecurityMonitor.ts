'use client';

/**
 * 🔐 DETECTOR DE EXPOSICIÓN DE VARIABLES EN EL CLIENTE
 * 
 * Este hook se ejecuta solo en el cliente para detectar si variables
 * del servidor están siendo expuestas accidentalmente.
 */

import { useEffect } from 'react';

const SERVER_ONLY_VARS = [
  'FAL_API_KEY',
  'OPENAI_API_KEY', 
  'BLOB_READ_WRITE_TOKEN',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'REDIS_PASSWORD',
  'SMTP_PASS',
  'DATADOG_API_KEY'
] as const;

export function useSecurityMonitor() {
  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const exposedVars: string[] = [];

    // Verificar variables del servidor expuestas
    for (const varName of SERVER_ONLY_VARS) {
      // @ts-ignore - Verificación intencional de exposición
      if (process.env[varName]) {
        exposedVars.push(varName);
      }
    }

    // Verificar variables NEXT_PUBLIC que no deberían existir
    const dangerousPublicVars: string[] = [];
    if (typeof window !== 'undefined') {
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('NEXT_PUBLIC_')) {
          const cleanKey = key.replace('NEXT_PUBLIC_', '');
          if (SERVER_ONLY_VARS.some(serverVar => 
            serverVar.includes(cleanKey) || cleanKey.includes('SECRET') || cleanKey.includes('KEY')
          )) {
            dangerousPublicVars.push(key);
          }
        }
      });
    }

    // Reportar problemas de seguridad
    if (exposedVars.length > 0) {
      console.error('🚨 SECURITY ALERT: Server variables exposed to client:', exposedVars);
      
      // Mostrar alerta visual en desarrollo
      const message = `SECURITY VIOLATION: Variables del servidor expuestas: ${exposedVars.join(', ')}`;
      setTimeout(() => {
        alert(message);
      }, 100);
    }

    if (dangerousPublicVars.length > 0) {
      console.warn('⚠️ WARNING: Potentially dangerous public variables:', dangerousPublicVars);
    }

    // Log de variables públicas seguras detectadas
    const safePublicVars = Object.keys(process.env).filter(key => 
      key.startsWith('NEXT_PUBLIC_') && 
      !dangerousPublicVars.includes(key)
    );

    if (safePublicVars.length > 0) {
      console.info('✅ Safe public variables detected:', safePublicVars);
    }

  }, []);

  // Función para verificar una variable específica
  const checkVariable = (varName: string): boolean => {
    // @ts-ignore
    const isExposed = !!process.env[varName];
    const shouldBeServerOnly = SERVER_ONLY_VARS.includes(varName as any);
    
    if (isExposed && shouldBeServerOnly) {
      console.error(`🚨 Variable '${varName}' should be server-only but is exposed to client!`);
      return false;
    }
    
    return true;
  };

  return {
    checkVariable,
    serverOnlyVars: SERVER_ONLY_VARS
  };
}

/**
 * Componente para monitoreo de seguridad en desarrollo
 */
export function SecurityMonitor() {
  useSecurityMonitor();
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 255, 0, 0.1)',
        border: '1px solid #00ff00',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        color: '#00ff00'
      }}
    >
      🔐 Security Monitor Active
    </div>
  );
}

/**
 * Utilidad para verificar el bundle del cliente
 */
export function analyzeBundleExposure(): void {
  if (typeof window === 'undefined') {
    console.warn('analyzeBundleExposure() called on server side');
    return;
  }

  console.group('🔍 Bundle Security Analysis');
  
  // Verificar process.env
  console.log('Client process.env keys:', Object.keys(process.env));
  
  // Verificar window globals que podrían contener secretos
  const suspiciousGlobals = Object.keys(window).filter(key => 
    key.toLowerCase().includes('secret') ||
    key.toLowerCase().includes('key') ||
    key.toLowerCase().includes('token') ||
    key.toLowerCase().includes('password')
  );
  
  if (suspiciousGlobals.length > 0) {
    console.warn('⚠️ Suspicious global variables found:', suspiciousGlobals);
  }
  
  // Verificar localStorage/sessionStorage
  try {
    const localKeys = Object.keys(localStorage).filter(key =>
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('key') ||
      key.toLowerCase().includes('token')
    );
    
    if (localKeys.length > 0) {
      console.warn('⚠️ Potentially sensitive localStorage keys:', localKeys);
    }
  } catch (e) {
    // localStorage no disponible
  }
  
  console.groupEnd();
}
