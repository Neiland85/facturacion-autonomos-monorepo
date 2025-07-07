import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Middleware para limitar rate de webhooks
 */
export class WebhookRateLimitMiddleware {
  private readonly rateLimiter;

  constructor() {
    // Configurar rate limit específico para webhooks
    this.rateLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 100, // máximo 100 webhooks por minuto por IP
      message: {
        status: 'error',
        message: 'Demasiados webhooks recibidos, inténtalo más tarde',
        retryAfter: 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Usar IP real del cliente
      keyGenerator: (req: Request) => {
        return this.getClientIP(req);
      },
      // Configuración específica para webhooks
      skip: (_req: Request) => {
        // Saltar rate limit en desarrollo
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        return false;
      },
    });
  }

  /**
   * Middleware para aplicar rate limit a webhooks
   */
  public limitWebhookRequests = (req: Request, res: Response, next: NextFunction): void => {
    this.rateLimiter(req, res, next);
  };

  /**
   * Obtiene la IP real del cliente
   */
  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() || 'unknown';
    }
    return req.socket.remoteAddress || 'unknown';
  }
}
