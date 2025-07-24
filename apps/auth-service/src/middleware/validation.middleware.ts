import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/**
 * Esquemas de validación con Zod
 */
export const schemas = {
  register: z.object({
    body: z.object({
      email: z
        .string()
        .email('Email inválido')
        .min(5, 'Email debe tener al menos 5 caracteres')
        .max(100, 'Email no puede exceder 100 caracteres'),
      password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(128, 'La contraseña no puede exceder 128 caracteres')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\[\]{};':"\\|,.<>?-])/,
          'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'
        ),
      name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    })
  }),

  login: z.object({
    body: z.object({
      email: z
        .string()
        .email('Email inválido')
        .min(5, 'Email debe tener al menos 5 caracteres'),
      password: z
        .string()
        .min(1, 'Contraseña requerida')
    })
  }),

  verify2FA: z.object({
    body: z.object({
      token: z
        .string()
        .min(6, 'El código debe tener al menos 6 caracteres')
        .max(8, 'El código no puede exceder 8 caracteres')
        .regex(/^[A-F0-9]{8}$|^\d{6}$/, 'Formato de código inválido')
    })
  }),

  setup2FA: z.object({
    body: z.object({
      token: z
        .string()
        .length(6, 'El código debe tener exactamente 6 dígitos')
        .regex(/^\d{6}$/, 'El código debe contener solo números')
    })
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z
        .string()
        .min(1, 'Contraseña actual requerida'),
      newPassword: z
        .string()
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
        .max(128, 'La contraseña no puede exceder 128 caracteres')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\[\]{};':"\\|,.<>?-])/,
          'La nueva contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'
        )
    })
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z
        .string()
        .optional() // Puede venir en cookie o body
    })
  })
};

/**
 * Middleware genérico de validación con Zod
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors
        });
        return;
      }

      console.error('Error de validación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para sanitizar entrada
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = value.trim();
      }
    }
  }

  // Sanitizar query params
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = value.trim();
      }
    }
  }

  next();
};

/**
 * Middleware para validar headers requeridos
 */
export const validateHeaders = (requiredHeaders: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingHeaders = requiredHeaders.filter(
      header => !req.headers[header.toLowerCase()]
    );

    if (missingHeaders.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Headers requeridos faltantes',
        missingHeaders
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para validar Content-Type
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];

    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      res.status(415).json({
        success: false,
        message: 'Tipo de contenido no soportado',
        allowedTypes
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para limitar tamaño del payload
 */
export const validatePayloadSize = (maxSizeKB: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = maxSizeKB * 1024;

    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        success: false,
        message: `Payload demasiado grande. Máximo permitido: ${maxSizeKB}KB`
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para validar IP whitelist (opcional)
 */
export const validateIPWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress || '';

    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.log(`IP bloqueada: ${clientIP}`);
      res.status(403).json({
        success: false,
        message: 'Acceso denegado desde esta IP'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para validar User-Agent (prevenir bots básicos)
 */
export const validateUserAgent = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    res.status(400).json({
      success: false,
      message: 'User-Agent requerido'
    });
    return;
  }

  // Lista básica de bots maliciosos
  const suspiciousAgents = [
    'curl',
    'wget',
    'python-requests',
    'bot',
    'crawler',
    'spider'
  ];

  const isSuspicious = suspiciousAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  );

  if (isSuspicious) {
    console.log(`User-Agent sospechoso: ${userAgent}`);
    res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
    return;
  }

  next();
};

/**
 * Validadores específicos exportados
 */
export const validateRegister = validate(schemas.register);
export const validateLogin = validate(schemas.login);
export const validateVerify2FA = validate(schemas.verify2FA);
export const validateSetup2FA = validate(schemas.setup2FA);
export const validateChangePassword = validate(schemas.changePassword);
export const validateRefreshToken = validate(schemas.refreshToken);
