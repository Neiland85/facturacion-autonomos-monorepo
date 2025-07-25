/**
 * 🔐 HOOK DE MONITOREO DE SEGURIDAD - CLIENTE
 *
 * Este hook detecta variables de entorno sensibles expuestas al cliente
 * y proporciona alertas en tiempo real durante el desarrollo.
 *
 * USAGE: Solo en componentes del cliente para monitoreo de seguridad.
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Variables que NUNCA deben estar expuestas al cliente
 */
const SENSITIVE_KEYS = [
  'FAL_API_KEY',
  'OPENAI_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_SECRET',
  'EMAIL_PASSWORD',
  'SMTP_PASSWORD',
  'REDIS_URL',
  'ENCRYPTION_KEY',
] as const;

interface SecurityMonitorResult {
  exposedVars: string[];
  isClientSide: boolean;
  lastCheck: Date | null;
  securityScore: number;
}

export function useSecurityMonitor(): SecurityMonitorResult {
  const [exposedVars, setExposedVars] = useState<string[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isClientSide] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (!isClientSide) return;

    const checkExposedVars = () => {
      const exposed: string[] = [];

      // Verificar variables sensibles en process.env del cliente
      SENSITIVE_KEYS.forEach(key => {
        // Verificar si está disponible directamente
        if (typeof (process.env as any)[key] !== 'undefined') {
          exposed.push(key);
        }

        // Verificar si está expuesta como NEXT_PUBLIC_*
        if (typeof (process.env as any)[`NEXT_PUBLIC_${key}`] !== 'undefined') {
          exposed.push(`NEXT_PUBLIC_${key}`);
        }
      });

      // Verificar variables del window object (contaminación global)
      if (typeof window !== 'undefined') {
        SENSITIVE_KEYS.forEach(key => {
          if ((window as any)[key]) {
            exposed.push(`window.${key}`);
          }
        });
      }

      setExposedVars(exposed);
      setLastCheck(new Date());

      // Alertas en desarrollo
      if (process.env.NODE_ENV === 'development' && exposed.length > 0) {
        console.warn(
          '🚨 SECURITY WARNING: Sensitive variables detected on client:',
          exposed
        );

        // Alerta visual solo en desarrollo
        if (typeof window !== 'undefined') {
          const alertDiv = document.createElement('div');
          alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px;
            border-radius: 8px;
            z-index: 9999;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          `;
          alertDiv.innerHTML = `
            🚨 SECURITY ALERT<br/>
            Variables exposed: ${exposed.join(', ')}<br/>
            <small>Check browser console for details</small>
          `;

          document.body.appendChild(alertDiv);

          // Auto-remove después de 10 segundos
          setTimeout(() => {
            if (document.body.contains(alertDiv)) {
              document.body.removeChild(alertDiv);
            }
          }, 10000);
        }
      }
    };

    // Verificación inicial
    checkExposedVars();

    // Verificación periódica en desarrollo
    let interval: NodeJS.Timeout | null = null;
    if (process.env.NODE_ENV === 'development') {
      interval = setInterval(checkExposedVars, 30000); // Cada 30 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClientSide]);

  const securityScore = Math.max(0, 100 - exposedVars.length * 25);

  return {
    exposedVars,
    isClientSide,
    lastCheck,
    securityScore,
  };
}
