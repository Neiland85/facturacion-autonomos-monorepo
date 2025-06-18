import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const applySecurityMiddleware = (app: any): void => {
  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por IP
  });

  app.use(limiter);
};
