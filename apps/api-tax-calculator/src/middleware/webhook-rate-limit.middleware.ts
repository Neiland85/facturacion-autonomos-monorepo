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
      keyGenerator: ((req: Request) => {
        return this.getClientIP(req);
      }) as any,
      skip: ((_req: Request) => {
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        return false;
      }) as any,
    });
  }

  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    
    if (forwardedStr && typeof forwardedStr === 'string') {
      return forwardedStr.split(',')[0].trim();
    }
    
    return req.socket?.remoteAddress || req.ip || 'unknown';
  }

  public apply(req: Request, res: Response, next: NextFunction): void {
    if (!this.rateLimiter) {
      next();
      return;
    }
    (this.rateLimiter as any)(req, res, next);
  }

  public limitWebhookRequests = (req: Request, res: Response, next: NextFunction): void => {
    this.apply(req, res, next);
  };

  public async resetLimit(ip: string): Promise<void> {
    try {
      if (this.rateLimiter && 'resetKey' in this.rateLimiter) {
        (this.rateLimiter as any).resetKey(ip);
      }
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }
}
