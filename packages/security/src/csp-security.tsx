/**
 * 🛡️ CONTENT SECURITY POLICY (CSP) PARA FRONTEND
 *
 * Configuración avanzada de CSP para protección contra XSS y otras vulnerabilidades
 */

/**
 * Configuración CSP por ambiente
 */
const CSP_POLICIES = {
  development: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Necesario para desarrollo
      "'unsafe-inline'", // Solo para desarrollo
      'https://cdn.jsdelivr.net',
      'https://vercel.live',
      'https://*.vercel.app',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Necesario para CSS-in-JS
      'https://fonts.googleapis.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'http:', // Solo en desarrollo
    ],
    'connect-src': [
      "'self'",
      'https://api.facturacion-autonomos.com',
      'https://fal.run',
      'https://api.openai.com',
      'http://localhost:*',
      'ws://localhost:*',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  production: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'connect-src': [
      "'self'",
      'https://api.facturacion-autonomos.com',
      'https://fal.run',
      'https://api.openai.com',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': [],
  },
};

/**
 * Headers de seguridad adicionales
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Generar nonce para scripts/estilos inline
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array);
  } else {
    // Fallback para entornos sin crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '');
}

/**
 * Construir string CSP de forma segura
 */
export function buildCSPString(
  environment: 'development' | 'production',
  nonce?: string
): string {
  const policies = JSON.parse(JSON.stringify(CSP_POLICIES[environment]));

  // Agregar nonce si está disponible
  if (nonce) {
    if (policies['script-src']) {
      policies['script-src'].push(`'nonce-${nonce}'`);
    }
    if (policies['style-src']) {
      policies['style-src'].push(`'nonce-${nonce}'`);
    }
  }

  const directives: string[] = [];

  for (const [directive, sources] of Object.entries(policies)) {
    if (Array.isArray(sources)) {
      if (sources.length === 0) {
        directives.push(directive);
      } else {
        directives.push(`${directive} ${sources.join(' ')}`);
      }
    }
  }

  return directives.join('; ');
}

/**
 * Aplicar CSP mediante meta tag
 */
export function applyCSPMeta(nonce?: string): void {
  if (typeof document === 'undefined') return;

  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const cspString = buildCSPString(environment, nonce);

  // Crear o actualizar meta tag CSP
  let metaCSP = document.querySelector(
    'meta[http-equiv="Content-Security-Policy"]'
  ) as HTMLMetaElement;
  if (!metaCSP) {
    metaCSP = document.createElement('meta');
    metaCSP.httpEquiv = 'Content-Security-Policy';
    document.head.appendChild(metaCSP);
  }
  metaCSP.content = cspString;

  // Agregar otros headers de seguridad como meta tags cuando sea posible
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (key === 'X-Frame-Options') {
      let metaFrame = document.querySelector(
        'meta[http-equiv="X-Frame-Options"]'
      ) as HTMLMetaElement;
      if (!metaFrame) {
        metaFrame = document.createElement('meta');
        metaFrame.httpEquiv = 'X-Frame-Options';
        document.head.appendChild(metaFrame);
      }
      metaFrame.content = value;
    }
  });
}

/**
 * Hook para obtener nonce actual
 */
export function useCSPNonce(): string | null {
  if (typeof window === 'undefined') return null;

  const metaTag = document.querySelector('meta[name="csp-nonce"]');
  return metaTag?.getAttribute('content') || null;
}

/**
 * Validador de URLs contra CSP
 */
export function isURLAllowedByCSP(
  url: string,
  directive: string = 'connect-src'
): boolean {
  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const policies = CSP_POLICIES[environment];
  const allowedSources =
    (policies[directive as keyof typeof policies] as string[]) || [];

  try {
    const urlObj = new URL(url, window?.location?.origin);
    const origin = urlObj.origin;

    return allowedSources.some(source => {
      if (source === "'self'") {
        return (
          typeof window !== 'undefined' && origin === window.location.origin
        );
      }
      if (source.startsWith('https://')) {
        return origin === source || url.startsWith(source);
      }
      if (source === 'https:') {
        return urlObj.protocol === 'https:';
      }
      if (source === 'http:') {
        return urlObj.protocol === 'http:';
      }
      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Fetch seguro que respeta CSP
 */
export function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Verificar si la URL está permitida por CSP
  if (!isURLAllowedByCSP(url)) {
    return Promise.reject(new Error(`URL bloqueada por CSP: ${url}`));
  }

  // Agregar headers de seguridad
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      ...options.headers,
    },
  };

  return fetch(url, secureOptions);
}

/**
 * Reportar violaciones CSP
 */
export function setupCSPReporting(): void {
  if (typeof window === 'undefined') return;

  document.addEventListener('securitypolicyviolation', event => {
    const violation = {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    console.error('🚨 CSP Violation:', violation);

    // En producción, enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      secureFetch('/api/security/csp-violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation),
      }).catch(console.error);
    }
  });
}

/**
 * Inicializar seguridad CSP
 */
export function initializeCSPSecurity(nonce?: string): void {
  if (typeof window === 'undefined') return;

  // Aplicar CSP
  applyCSPMeta(nonce);

  // Configurar reportes
  setupCSPReporting();

  console.log('🛡️ Sistema CSP inicializado');
}

export default {
  buildCSPString,
  generateNonce,
  applyCSPMeta,
  useCSPNonce,
  secureFetch,
  setupCSPReporting,
  initializeCSPSecurity,
  isURLAllowedByCSP,
  SECURITY_HEADERS,
  CSP_POLICIES,
};
