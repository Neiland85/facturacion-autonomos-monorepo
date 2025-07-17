import { NextFunction, Request, Response } from 'express';

/**
 * Middleware para health checks
 */
export const healthCheck = (req: Request, res: Response, next: NextFunction) => {
  // Solo manejar rutas de health check
  if (req.path === '/health') {
    return res.status(200).json({
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      cpu: {
        usage: process.cpuUsage()
      }
    });
  }

  if (req.path === '/health/detailed') {
    return res.status(200).json({
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: {
        usage: process.cpuUsage()
      },
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null
    });
  }

  // Si no es una ruta de health check, continuar
  next();
};
