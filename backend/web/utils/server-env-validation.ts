/**
 * 🔐 SISTEMA DE VALIDACIÓN DE SEGURIDAD - VARIABLES DE ENTORNO
 *
 * Este módulo previene la exposición accidental de API keys y secretos
 * en el lado del cliente, implementando validaciones estrictas del servidor.
 *
 * SECURITY: Nunca importar este archivo en componentes del cliente.
 */

/**
 * Variables de entorno sensibles que NUNCA deben exponerse al cliente
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

/**
 * Verificar que estamos ejecutando en el lado del servidor
 */
export function ensureServerSide(context: string = 'Server operation'): void {
  if (typeof window !== 'undefined') {
    const error = `🚨 SECURITY VIOLATION: ${context} attempted on client side`;
    console.error(error);
    throw new Error(error);
  }
}

/**
 * Validación completa de variables de entorno del servidor
 */
export function validateServerEnvironment(): void {
  ensureServerSide('Environment validation');

  const missingKeys: string[] = [];
  const exposedKeys: string[] = [];

  // Verificar claves sensibles
  SENSITIVE_KEYS.forEach(key => {
    const value = process.env[key];

    if (!value) {
      missingKeys.push(key);
    }

    // Verificar si está expuesta en variables públicas (NEXT_PUBLIC_*)
    if (process.env[`NEXT_PUBLIC_${key}`]) {
      exposedKeys.push(`NEXT_PUBLIC_${key}`);
    }
  });

  // Reportar claves faltantes (warning, no error crítico)
  if (missingKeys.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingKeys.join(', ')}`);
  }

  // ERROR CRÍTICO: Claves expuestas
  if (exposedKeys.length > 0) {
    const error = `🚨 CRITICAL SECURITY ERROR: Sensitive keys exposed as public: ${exposedKeys.join(', ')}`;
    console.error(error);
    throw new Error(error);
  }

  console.log('✅ Server environment validation passed');
}

/**
 * Obtener una variable de entorno sensible de forma segura
 */
export function getSecureEnvVar(key: keyof typeof process.env): string {
  ensureServerSide(`Access to ${key}`);

  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Validar FAL_API_KEY específicamente
 */
export function validateFalApiKey(): string {
  const key = getSecureEnvVar('FAL_API_KEY');

  if (!key.startsWith('fal_')) {
    throw new Error('FAL_API_KEY must start with "fal_"');
  }

  return key;
}

/**
 * Validar OPENAI_API_KEY específicamente
 */
export function validateOpenAiApiKey(): string {
  const key = getSecureEnvVar('OPENAI_API_KEY');

  if (!key.startsWith('sk-')) {
    throw new Error('OPENAI_API_KEY must start with "sk-"');
  }

  return key;
}

/**
 * Configuración de inicialización para rutas API
 */
export function initializeApiRoute(routeName: string): void {
  ensureServerSide(`API Route: ${routeName}`);
  validateServerEnvironment();
  console.log(`🛡️ Security validated for API route: ${routeName}`);
}
