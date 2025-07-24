/**
 * Middleware de Rate Limiting para carga de archivos OCR
 * Protege contra ataques DoS y limita el uso de recursos
 */

interface RateLimitConfig {
  // Límites por IP
  maxUploadsPerMinute: number;
  maxUploadsPerHour: number;
  maxUploadsPerDay: number;
  
  // Límites por tamaño
  maxBytesPerMinute: number;
  maxBytesPerHour: number;
  
  // Límites de concurrencia
  maxConcurrentUploads: number;
  maxConcurrentUploadsPerUser: number;
  
  // Configuración de memoria
  cleanupInterval: number; // Intervalo de limpieza en ms
  memoryRetention: number; // Tiempo de retención en ms
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxUploadsPerMinute: 5,
  maxUploadsPerHour: 50,
  maxUploadsPerDay: 200,
  maxBytesPerMinute: 25 * 1024 * 1024, // 25MB
  maxBytesPerHour: 100 * 1024 * 1024, // 100MB
  maxConcurrentUploads: 10,
  maxConcurrentUploadsPerUser: 3,
  cleanupInterval: 5 * 60 * 1000, // 5 minutos
  memoryRetention: 24 * 60 * 60 * 1000 // 24 horas
};

/**
 * Estructura para tracking de uploads por IP
 */
interface UploadTracker {
  uploads: Array<{
    timestamp: number;
    size: number;
    userId?: string;
  }>;
  concurrentUploads: number;
  userConcurrentUploads: Map<string, number>;
  lastActivity: number;
}

/**
 * Rate Limiter para uploads de archivos
 */
class FileUploadRateLimiter {
  private trackers = new Map<string, UploadTracker>();
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  constructor(private config: RateLimitConfig) {
    this.startCleanup();
  }

  /**
   * Inicia el proceso de limpieza automática
   */
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Limpia registros antiguos
   */
  private cleanup() {
    const now = Date.now();
    const cutoff = now - this.config.memoryRetention;
    
    for (const [ip, tracker] of this.trackers.entries()) {
      // Limpiar uploads antiguos
      tracker.uploads = tracker.uploads.filter(upload => upload.timestamp > cutoff);
      
      // Eliminar tracker si no tiene actividad reciente
      if (tracker.lastActivity < cutoff && tracker.uploads.length === 0) {
        this.trackers.delete(ip);
      }
    }
  }

  /**
   * Obtiene o crea un tracker para una IP
   */
  private getTracker(ip: string): UploadTracker {
    if (!this.trackers.has(ip)) {
      this.trackers.set(ip, {
        uploads: [],
        concurrentUploads: 0,
        userConcurrentUploads: new Map(),
        lastActivity: Date.now()
      });
    }
    
    const tracker = this.trackers.get(ip)!;
    tracker.lastActivity = Date.now();
    return tracker;
  }

  /**
   * Verifica si un upload está permitido
   */
  checkRateLimit(ip: string, fileSize: number, userId?: string): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number; // segundos hasta que puede reintentar
  } {
    const tracker = this.getTracker(ip);
    const now = Date.now();

    // Verificar límites de concurrencia global
    if (tracker.concurrentUploads >= this.config.maxConcurrentUploads) {
      return {
        allowed: false,
        reason: 'Demasiados uploads concurrentes desde esta IP',
        retryAfter: 60
      };
    }

    // Verificar límites de concurrencia por usuario
    if (userId) {
      const userConcurrent = tracker.userConcurrentUploads.get(userId) || 0;
      if (userConcurrent >= this.config.maxConcurrentUploadsPerUser) {
        return {
          allowed: false,
          reason: 'Demasiados uploads concurrentes para este usuario',
          retryAfter: 30
        };
      }
    }

    // Filtrar uploads por tiempo
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    const uploadsLastMinute = tracker.uploads.filter(u => now - u.timestamp < minute);
    const uploadsLastHour = tracker.uploads.filter(u => now - u.timestamp < hour);
    const uploadsLastDay = tracker.uploads.filter(u => now - u.timestamp < day);

    // Verificar límites por número de uploads
    if (uploadsLastMinute.length >= this.config.maxUploadsPerMinute) {
      return {
        allowed: false,
        reason: 'Demasiados uploads en el último minuto',
        retryAfter: 60
      };
    }

    if (uploadsLastHour.length >= this.config.maxUploadsPerHour) {
      return {
        allowed: false,
        reason: 'Demasiados uploads en la última hora',
        retryAfter: 3600
      };
    }

    if (uploadsLastDay.length >= this.config.maxUploadsPerDay) {
      return {
        allowed: false,
        reason: 'Límite diario de uploads alcanzado',
        retryAfter: 86400
      };
    }

    // Verificar límites por tamaño de datos
    const bytesLastMinute = uploadsLastMinute.reduce((sum, u) => sum + u.size, 0);
    const bytesLastHour = uploadsLastHour.reduce((sum, u) => sum + u.size, 0);

    if (bytesLastMinute + fileSize > this.config.maxBytesPerMinute) {
      return {
        allowed: false,
        reason: 'Límite de datos por minuto excedido',
        retryAfter: 60
      };
    }

    if (bytesLastHour + fileSize > this.config.maxBytesPerHour) {
      return {
        allowed: false,
        reason: 'Límite de datos por hora excedido',
        retryAfter: 3600
      };
    }

    return { allowed: true };
  }

  /**
   * Registra el inicio de un upload
   */
  startUpload(ip: string, fileSize: number, userId?: string): string {
    const tracker = this.getTracker(ip);
    const uploadId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Incrementar contadores de concurrencia
    tracker.concurrentUploads++;
    if (userId) {
      const userConcurrent = tracker.userConcurrentUploads.get(userId) || 0;
      tracker.userConcurrentUploads.set(userId, userConcurrent + 1);
    }

    // Registrar el upload
    tracker.uploads.push({
      timestamp: Date.now(),
      size: fileSize,
      userId
    });

    return uploadId;
  }

  /**
   * Registra el fin de un upload
   */
  endUpload(ip: string, userId?: string) {
    const tracker = this.getTracker(ip);
    
    // Decrementar contadores de concurrencia
    if (tracker.concurrentUploads > 0) {
      tracker.concurrentUploads--;
    }

    if (userId) {
      const userConcurrent = tracker.userConcurrentUploads.get(userId) || 0;
      if (userConcurrent > 0) {
        tracker.userConcurrentUploads.set(userId, userConcurrent - 1);
      }
    }
  }

  /**
   * Obtiene estadísticas del rate limiter
   */
  getStats(): {
    totalTrackedIPs: number;
    totalConcurrentUploads: number;
    memoryUsage: number;
  } {
    let totalConcurrent = 0;
    let memoryUsage = 0;

    for (const tracker of this.trackers.values()) {
      totalConcurrent += tracker.concurrentUploads;
      memoryUsage += tracker.uploads.length * 32; // Estimación básica
    }

    return {
      totalTrackedIPs: this.trackers.size,
      totalConcurrentUploads: totalConcurrent,
      memoryUsage
    };
  }

  /**
   * Limpia todos los datos (útil para testing)
   */
  reset() {
    this.trackers.clear();
  }

  /**
   * Detiene el limpiador automático
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.trackers.clear();
  }
}

// Instancia global del rate limiter
let globalRateLimiter: FileUploadRateLimiter | null = null;

/**
 * Obtiene o crea la instancia global del rate limiter
 */
function getRateLimiter(config?: Partial<RateLimitConfig>): FileUploadRateLimiter {
  if (!globalRateLimiter) {
    const finalConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
    globalRateLimiter = new FileUploadRateLimiter(finalConfig);
  }
  return globalRateLimiter;
}

/**
 * Interfaz simple para request/response sin dependencias de Express
 */
interface RequestLike {
  ip?: string;
  user?: { id?: string };
  file?: { size?: number };
  [key: string]: any;
}

interface ResponseLike {
  status(code: number): ResponseLike;
  json(obj: any): ResponseLike;
  set?(name: string, value: string): void;
}

type NextFunctionLike = (error?: any) => void;

/**
 * Middleware de rate limiting para uploads
 */
export function createUploadRateLimitMiddleware(config?: Partial<RateLimitConfig>) {
  const rateLimiter = getRateLimiter(config);

  return (req: RequestLike, res: ResponseLike, next: NextFunctionLike) => {
    const ip = req.ip || 'unknown';
    const userId = req.user?.id;
    const fileSize = req.file?.size || 0;

    // Verificar rate limit
    const result = rateLimiter.checkRateLimit(ip, fileSize, userId);

    if (!result.allowed) {
      // Agregar headers de rate limiting
      if (res.set) {
        res.set('X-RateLimit-Limit', config?.maxUploadsPerMinute?.toString() || '5');
        res.set('X-RateLimit-Remaining', '0');
        res.set('X-RateLimit-Reset', (Date.now() + (result.retryAfter || 60) * 1000).toString());
        if (result.retryAfter) {
          res.set('Retry-After', result.retryAfter.toString());
        }
      }

      const response = res.status(429);
      if (response.json) {
        return response.json({
          success: false,
          error: result.reason || 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: result.retryAfter
        });
      }
      return;
    }

    // Registrar inicio del upload
    const uploadId = rateLimiter.startUpload(ip, fileSize, userId);
    req.uploadId = uploadId;

    // Asegurar limpieza al final
    const originalSend = res.json;
    if (originalSend) {
      res.json = function(body: any) {
        rateLimiter.endUpload(ip, userId);
        return originalSend.call(this, body);
      };
    }

    next();
  };
}

/**
 * Middleware para monitoreo de rate limiting
 */
export function createRateLimitStatsMiddleware() {
  return (req: RequestLike, res: ResponseLike, next: NextFunctionLike) => {
    if (req.url === '/api/admin/upload-stats' && globalRateLimiter) {
      const stats = globalRateLimiter.getStats();
      const response = res.status(200);
      if (response.json) {
        return response.json({
          success: true,
          stats: {
            ...stats,
            timestamp: new Date().toISOString(),
            config: DEFAULT_RATE_LIMIT_CONFIG
          }
        });
      }
    }
    next();
  };
}

/**
 * Utilidades para rate limiting
 */
export const RateLimitUtils = {
  /**
   * Obtiene estadísticas actuales
   */
  getStats() {
    return globalRateLimiter?.getStats() || null;
  },

  /**
   * Reinicia el rate limiter
   */
  reset() {
    globalRateLimiter?.reset();
  },

  /**
   * Verifica si una IP puede hacer upload
   */
  checkIP(ip: string, fileSize: number, userId?: string) {
    if (!globalRateLimiter) {
      return { allowed: true };
    }
    return globalRateLimiter.checkRateLimit(ip, fileSize, userId);
  },

  /**
   * Configura el rate limiter
   */
  configure(config: Partial<RateLimitConfig>) {
    if (globalRateLimiter) {
      globalRateLimiter.destroy();
    }
    globalRateLimiter = new FileUploadRateLimiter({ ...DEFAULT_RATE_LIMIT_CONFIG, ...config });
  }
};

// Cleanup al terminar el proceso
process.on('exit', () => {
  globalRateLimiter?.destroy();
});

export { FileUploadRateLimiter, type RateLimitConfig };
