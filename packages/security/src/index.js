/**
 * 🛡️ PUNTO DE ENTRADA PRINCIPAL PARA SEGURIDAD
 *
 * Exporta todos los componentes de seguridad del sistema
 */

// Middleware principal de seguridad completa
const { setupCompleteSecurity } = require('./complete-security');

// Componentes individuales de seguridad
const {
  setupErrorHandling,
  errorUtils,
  asyncErrorHandler,
} = require('./error-handling');
const { setupCSRFProtection, csrfUtils } = require('./csrf-protection');

// Componentes de seguridad frontend (requieren React)
// Se exportan como módulos separados para evitar dependencias
const frontendSecurity = {
  // Para usar: const { escapeHtml } = require('@facturacion/security/frontend-security');
  frontendSecurityPath: './frontend-security',
  cspSecurityPath: './csp-security',
  safeComponentsPath: './safe-components',
  secureDocumentPath: './secure-document',
};

// Exportar todo para fácil uso
module.exports = {
  // Principal - usar este para configuración completa
  setupCompleteSecurity,

  // Componentes individuales (uso avanzado)
  setupErrorHandling,
  setupCSRFProtection,

  // Utilidades
  errorUtils,
  csrfUtils,
  asyncErrorHandler,

  // Paths para componentes frontend
  ...frontendSecurity,

  // Configuraciones por defecto
  defaultSecurityConfig: {
    enableCSRF: true,
    strictCSRF: process.env.NODE_ENV === 'production',
    enableErrorHandling: true,
    enableRequestLogging: true,
    requestTimeoutMs: 30000,
    enablePayloadLimit: true,

    // Configuraciones frontend
    enableCSP: true,
    enableXSSProtection: true,
    enableInputSanitization: true,
    enableSecureHeaders: true,

    // CSP por ambiente
    cspEnvironment:
      process.env.NODE_ENV === 'production' ? 'production' : 'development',
  },
};
