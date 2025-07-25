/**
 * Utilidades auxiliares para el Auth Service
 */

/**
 * Formatear tiempo de actividad en formato legible
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
}

/**
 * Generar ID único seguro
 */
export function generateSecureId(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Sanitizar datos sensibles para logging
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Validar email con regex estricto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generar token seguro
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash seguro de string
 */
export async function secureHash(input: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Comparar strings de forma segura (timing attack resistant)
 */
export function secureCompare(a: string, b: string): boolean {
  const crypto = require('crypto');
  
  if (a.length !== b.length) {
    return false;
  }
  
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Detectar User-Agent sospechoso
 */
export function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /crawler/i,
    /scanner/i,
    /sqlmap/i,
    /nikto/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Limpiar string de caracteres peligrosos
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // XSS básico
    .replace(/[;()]/g, '')   // SQL injection básico
    .trim();
}

/**
 * Verificar si una IP está en una lista de IPs permitidas
 */
export function isIPAllowed(ip: string, allowedIPs: string[]): boolean {
  return allowedIPs.includes(ip) || allowedIPs.includes('*');
}

/**
 * Normalizar IP address (manejar IPv6, proxies, etc.)
 */
export function normalizeIP(ip: string): string {
  // Remover prefijos IPv6 mapped
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  // Manejar localhost
  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  return ip;
}

/**
 * Generar código numérico para 2FA
 */
export function generateNumericCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }
  
  return code;
}

/**
 * Formatear fecha para logging
 */
export function formatLogDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Calcular tiempo transcurrido en formato legible
 */
export function formatElapsedTime(startTime: number): string {
  const elapsed = Date.now() - startTime;
  
  if (elapsed < 1000) {
    return `${elapsed}ms`;
  }
  
  const seconds = Math.floor(elapsed / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

/**
 * Validar formato de teléfono español
 */
export function isValidSpanishPhone(phone: string): boolean {
  const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Formatear memoria en formato legible
 */
export function formatMemory(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
