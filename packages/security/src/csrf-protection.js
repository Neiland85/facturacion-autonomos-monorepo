/**
 * 🛡️ PROTECCIÓN CONTRA CSRF (Cross-Site Request Forgery)
 *
 * Implementación de tokens CSRF y validación para APIs REST
 */

const crypto = require('crypto');

// Almacenamiento temporal de tokens CSRF (en producción usar Redis)
const csrfTokens = new Map();

/**
 * Genera un token CSRF único
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Genera y almacena un token CSRF para una sesión/IP
 */
function createCSRFToken(sessionId, userAgent = '', ip = '') {
  const token = generateCSRFToken();
  const tokenData = {
    token,
    sessionId,
    userAgent,
    ip,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hora
  };

  csrfTokens.set(token, tokenData);

  // Limpiar tokens expirados (solo mantener los últimos 1000)
  if (csrfTokens.size > 1000) {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
      if (value.expiresAt < now) {
        csrfTokens.delete(key);
      }
    }
  }

  return token;
}

/**
 * Valida un token CSRF
 */
function validateCSRFToken(token, sessionId, userAgent = '', ip = '') {
  if (!token || !sessionId) {
    return false;
  }

  const tokenData = csrfTokens.get(token);
  if (!tokenData) {
    return false;
  }

  // Verificar expiración
  if (tokenData.expiresAt < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }

  // Verificar coincidencia de sesión
  if (tokenData.sessionId !== sessionId) {
    return false;
  }

  // Verificar User-Agent (opcional, más estricto)
  if (tokenData.userAgent && tokenData.userAgent !== userAgent) {
    console.warn(
      `🚨 CSRF: User-Agent mismatch for token ${token.substring(0, 8)}...`
    );
    return false;
  }

  // Verificar IP (opcional, más estricto)
  if (tokenData.ip && tokenData.ip !== ip) {
    console.warn(`🚨 CSRF: IP mismatch for token ${token.substring(0, 8)}...`);
    return false;
  }

  return true;
}

/**
 * Middleware para generar tokens CSRF
 */
function csrfTokenGeneration(req, res, next) {
  // Obtener o crear session ID
  const sessionId =
    req.sessionID || req.get('X-Session-ID') || req.ip + req.get('User-Agent');

  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;

  // Generar nuevo token
  const csrfToken = createCSRFToken(sessionId, userAgent, ip);

  // Añadir token a la respuesta
  res.locals.csrfToken = csrfToken;
  res.set('X-CSRF-Token', csrfToken);

  // Para APIs, añadir al body de respuesta
  const originalJson = res.json;
  res.json = function (data) {
    if (typeof data === 'object' && data !== null) {
      data._csrf = csrfToken;
    }
    return originalJson.call(this, data);
  };

  next();
}

/**
 * Middleware para validar tokens CSRF
 */
function csrfTokenValidation(options = {}) {
  const {
    ignoreMethods = ['GET', 'HEAD', 'OPTIONS'],
    ignoreRoutes = ['/health', '/ping', '/api/public'],
    strictMode = false,
  } = options;

  return (req, res, next) => {
    const method = req.method.toUpperCase();
    const path = req.path;

    // Saltar métodos seguros
    if (ignoreMethods.includes(method)) {
      return next();
    }

    // Saltar rutas públicas
    if (ignoreRoutes.some(route => path.startsWith(route))) {
      return next();
    }

    // Obtener token del request
    const token =
      req.get('X-CSRF-Token') || req.body?._csrf || req.query?._csrf;

    if (!token) {
      console.warn(
        `🚨 CSRF: Missing token for ${method} ${path} from IP ${req.ip}`
      );
      return res.status(403).json({
        error: 'CSRF token required',
        message: 'Missing CSRF token in request',
        code: 'CSRF_TOKEN_MISSING',
      });
    }

    // Obtener session ID
    const sessionId =
      req.sessionID ||
      req.get('X-Session-ID') ||
      req.ip + req.get('User-Agent');

    const userAgent = strictMode ? req.get('User-Agent') : '';
    const ip = strictMode ? req.ip : '';

    // Validar token
    if (!validateCSRFToken(token, sessionId, userAgent, ip)) {
      console.error(
        `🚨 CSRF: Invalid token for ${method} ${path} from IP ${req.ip}`
      );
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed',
        code: 'CSRF_TOKEN_INVALID',
      });
    }

    console.log(`✅ CSRF: Token validated for ${method} ${path}`);
    next();
  };
}

/**
 * Middleware específico para autenticación con CSRF
 */
function authCSRFProtection(req, res, next) {
  const token = req.get('X-CSRF-Token');
  const sessionId = req.get('X-Session-ID') || req.ip;

  if (!token) {
    return res.status(403).json({
      error: 'Authentication requires CSRF token',
      message: 'X-CSRF-Token header is required for authentication',
      code: 'AUTH_CSRF_REQUIRED',
    });
  }

  if (!validateCSRFToken(token, sessionId)) {
    return res.status(403).json({
      error: 'Invalid authentication CSRF token',
      message: 'CSRF token validation failed for authentication',
      code: 'AUTH_CSRF_INVALID',
    });
  }

  next();
}

/**
 * Endpoint para obtener token CSRF
 */
function csrfTokenEndpoint(req, res) {
  const sessionId =
    req.sessionID || req.get('X-Session-ID') || req.ip + req.get('User-Agent');

  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress;

  const token = createCSRFToken(sessionId, userAgent, ip);

  res.json({
    csrfToken: token,
    expiresIn: 3600, // 1 hora en segundos
    usage: {
      header: 'X-CSRF-Token',
      body: '_csrf',
      query: '_csrf',
    },
  });
}

/**
 * Configuración completa de CSRF para Express
 */
function setupCSRFProtection(app, options = {}) {
  console.log('🛡️ Configurando protección CSRF...');

  const {
    enableTokenGeneration = true,
    strictValidation = false,
    customIgnoreRoutes = [],
  } = options;

  // Endpoint para obtener tokens CSRF
  app.get('/api/csrf-token', csrfTokenGeneration, csrfTokenEndpoint);

  // Generar tokens para todas las respuestas (opcional)
  if (enableTokenGeneration) {
    app.use(csrfTokenGeneration);
  }

  // Validación CSRF para rutas protegidas
  const validationOptions = {
    strictMode: strictValidation,
    ignoreRoutes: [
      '/health',
      '/ping',
      '/api/public',
      '/api/csrf-token',
      ...customIgnoreRoutes,
    ],
  };

  app.use(csrfTokenValidation(validationOptions));

  // Protección específica para autenticación
  app.use('/api/auth/login', authCSRFProtection);
  app.use('/api/auth/register', authCSRFProtection);
  app.use('/api/auth/reset-password', authCSRFProtection);

  console.log('✅ Protección CSRF configurada');
}

/**
 * Utilidades para manejo de tokens
 */
const csrfUtils = {
  /**
   * Limpiar tokens expirados manualmente
   */
  cleanExpiredTokens() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of csrfTokens.entries()) {
      if (value.expiresAt < now) {
        csrfTokens.delete(key);
        cleaned++;
      }
    }

    console.log(`🧹 CSRF: Cleaned ${cleaned} expired tokens`);
    return cleaned;
  },

  /**
   * Obtener estadísticas de tokens
   */
  getTokenStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const [, value] of csrfTokens.entries()) {
      if (value.expiresAt >= now) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      total: csrfTokens.size,
      active,
      expired,
    };
  },

  /**
   * Revocar token específico
   */
  revokeToken(token) {
    return csrfTokens.delete(token);
  },

  /**
   * Revocar todos los tokens de una sesión
   */
  revokeSessionTokens(sessionId) {
    let revoked = 0;
    for (const [key, value] of csrfTokens.entries()) {
      if (value.sessionId === sessionId) {
        csrfTokens.delete(key);
        revoked++;
      }
    }
    return revoked;
  },
};

module.exports = {
  setupCSRFProtection,
  csrfTokenGeneration,
  csrfTokenValidation,
  authCSRFProtection,
  csrfTokenEndpoint,
  generateCSRFToken,
  createCSRFToken,
  validateCSRFToken,
  csrfUtils,
};
