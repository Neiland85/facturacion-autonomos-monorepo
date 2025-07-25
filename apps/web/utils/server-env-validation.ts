/**
 * 🔐 VALIDACIÓN DE VARIABLES DE ENTORNO DEL SERVIDOR
 * 
 * Este módulo garantiza que las variables sensibles SOLO estén disponibles en el servidor
 * y nunca se expongan al cliente.
 */

interface ServerEnvVars {
  FAL_API_KEY: string;
  OPENAI_API_KEY: string;
  BLOB_READ_WRITE_TOKEN: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  REDIS_PASSWORD?: string;
}

interface ValidatedServerEnv {
  FAL_API_KEY: string;
  OPENAI_API_KEY: string;
  BLOB_READ_WRITE_TOKEN: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  REDIS_PASSWORD: string;
}

/**
 * Variables que NUNCA deben estar disponibles en el cliente
 */
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

/**
 * Validar que las variables críticas estén disponibles en el servidor
 */
export function validateServerEnvironment(): ValidatedServerEnv {
  // Verificar que estamos en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('🚨 SECURITY VIOLATION: validateServerEnvironment() called on client side!');
  }

  const requiredVars: (keyof ServerEnvVars)[] = [
    'FAL_API_KEY',
    'OPENAI_API_KEY',
    'BLOB_READ_WRITE_TOKEN'
  ];

  const missingVars: string[] = [];
  const env: Partial<ValidatedServerEnv> = {};

  // Verificar variables requeridas
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      env[varName] = value;
    }
  }

  // Verificar variables opcionales con defaults seguros
  env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/facturacion_dev';
  env.JWT_SECRET = process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    return 'dev-jwt-secret-change-in-production';
  })();
  env.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

  if (missingVars.length > 0) {
    throw new Error(`🚨 Missing required server environment variables: ${missingVars.join(', ')}`);
  }

  return env as ValidatedServerEnv;
}

/**
 * Detectar si variables del servidor están expuestas al cliente
 */
export function detectClientExposure(): void {
  // Solo ejecutar en el cliente
  if (typeof window === 'undefined') {
    return;
  }

  const exposedVars: string[] = [];

  for (const varName of SERVER_ONLY_VARS) {
    // @ts-ignore - Verificar si la variable está en process.env del cliente
    if (process.env[varName]) {
      exposedVars.push(varName);
    }
  }

  if (exposedVars.length > 0) {
    console.error(`🚨 SECURITY ALERT: Server variables exposed to client: ${exposedVars.join(', ')}`);
    
    // En desarrollo, mostrar alerta visual
    if (process.env.NODE_ENV === 'development') {
      const message = `SECURITY ALERT: Variables del servidor expuestas al cliente: ${exposedVars.join(', ')}`;
      alert(message);
    }
  }
}

/**
 * Wrapper seguro para acceder a variables del servidor en API routes
 */
export function getServerVar<T extends keyof ValidatedServerEnv>(
  varName: T
): ValidatedServerEnv[T] {
  if (typeof window !== 'undefined') {
    throw new Error(`🚨 SECURITY VIOLATION: Attempted to access server variable '${varName}' on client side!`);
  }

  const env = validateServerEnvironment();
  return env[varName];
}

/**
 * Verificar que estamos en el servidor (para API routes)
 */
export function ensureServerSide(context: string = 'Unknown'): void {
  if (typeof window !== 'undefined') {
    throw new Error(`🚨 SECURITY VIOLATION: ${context} must only run on server side!`);
  }
}

/**
 * Sanitizar variables de entorno para logging
 */
export function sanitizeEnvForLogging(env: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(env)) {
    if (SERVER_ONLY_VARS.some(sensitiveVar => key.includes(sensitiveVar))) {
      sanitized[key] = '[REDACTED]';
    } else if (key.toLowerCase().includes('secret') || 
               key.toLowerCase().includes('key') ||
               key.toLowerCase().includes('password') ||
               key.toLowerCase().includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Obtener configuración segura para logs
 */
export function getSecureLogConfig(): Record<string, any> {
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    hasSecrets: {
      FAL_API_KEY: !!process.env.FAL_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET
    }
  };
}

/**
 * Validar configuración de producción
 */
export function validateProductionConfig(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const requiredProdVars = [
    'FAL_API_KEY',
    'OPENAI_API_KEY', 
    'JWT_SECRET',
    'DATABASE_URL',
    'SESSION_SECRET'
  ];

  const missingProdVars = requiredProdVars.filter(
    varName => !process.env[varName] || process.env[varName]?.includes('dev-') || process.env[varName]?.includes('change-in-production')
  );

  if (missingProdVars.length > 0) {
    throw new Error(`🚨 Production environment validation failed. Missing or invalid variables: ${missingProdVars.join(', ')}`);
  }
}

// Auto-ejecutar verificaciones en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Ejecutar después de que la página cargue
  setTimeout(detectClientExposure, 1000);
}
