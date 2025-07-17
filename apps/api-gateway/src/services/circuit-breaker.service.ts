import CircuitBreaker from 'opossum';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface CircuitBreakerOptions {
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
  name: string;
}

export interface CircuitBreakerStats {
  name: string;
  state: 'open' | 'closed' | 'half-open';
  failures: number;
  successes: number;
  requests: number;
  errorPercentage: number;
  nextAttempt?: Date;
}

export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker>;
  private stats: Map<string, CircuitBreakerStats>;

  constructor() {
    this.breakers = new Map();
    this.stats = new Map();
  }

  /**
   * Crear circuit breaker para un servicio
   */
  createBreaker<T>(
    serviceName: string,
    action: (...args: any[]) => Promise<T>,
    options?: Partial<CircuitBreakerOptions>
  ): CircuitBreaker {
    const breakerOptions = {
      timeout: config.circuitBreaker.timeout,
      errorThresholdPercentage: config.circuitBreaker.errorThresholdPercentage,
      resetTimeout: config.circuitBreaker.resetTimeout,
      name: serviceName,
      ...options
    };

    const breaker = new CircuitBreaker(action, breakerOptions);

    // Configurar eventos del circuit breaker
    this.setupBreakerEvents(breaker, serviceName);

    // Registrar breaker
    this.breakers.set(serviceName, breaker);
    this.initializeStats(serviceName);

    logger.info(`Circuit breaker creado para ${serviceName}`, breakerOptions);

    return breaker;
  }

  /**
   * Obtener circuit breaker existente
   */
  getBreaker(serviceName: string): CircuitBreaker | undefined {
    return this.breakers.get(serviceName);
  }

  /**
   * Ejecutar acción a través del circuit breaker
   */
  async execute<T>(serviceName: string, action: () => Promise<T>): Promise<T> {
    let breaker = this.getBreaker(serviceName);

    // Crear breaker si no existe
    if (!breaker) {
      breaker = this.createBreaker(serviceName, action);
    }

    try {
      const result = await breaker.fire();
      return result;
    } catch (error) {
      // Si el circuit está abierto, lanzar error específico
      if (breaker.opened) {
        const stats = this.getStats(serviceName);
        throw new Error(`Circuit breaker abierto para ${serviceName}. Siguiente intento: ${stats?.nextAttempt}`);
      }
      
      // Re-lanzar error original
      throw error;
    }
  }

  /**
   * Obtener estadísticas del circuit breaker
   */
  getStats(serviceName: string): CircuitBreakerStats | undefined {
    return this.stats.get(serviceName);
  }

  /**
   * Obtener estadísticas de todos los circuit breakers
   */
  getAllStats(): CircuitBreakerStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Forzar apertura del circuit breaker
   */
  forceOpen(serviceName: string): void {
    const breaker = this.getBreaker(serviceName);
    if (breaker) {
      breaker.open();
      logger.warn(`Circuit breaker forzado a abierto: ${serviceName}`);
    }
  }

  /**
   * Forzar cierre del circuit breaker
   */
  forceClose(serviceName: string): void {
    const breaker = this.getBreaker(serviceName);
    if (breaker) {
      breaker.close();
      logger.info(`Circuit breaker forzado a cerrado: ${serviceName}`);
    }
  }

  /**
   * Limpiar todos los circuit breakers
   */
  shutdown(): void {
    this.breakers.forEach((breaker, serviceName) => {
      breaker.shutdown();
      logger.info(`Circuit breaker cerrado: ${serviceName}`);
    });
    
    this.breakers.clear();
    this.stats.clear();
  }

  /**
   * Configurar eventos del circuit breaker
   */
  private setupBreakerEvents(breaker: CircuitBreaker, serviceName: string): void {
    // Evento: Llamada exitosa
    breaker.on('success', (result) => {
      this.updateStats(serviceName, { type: 'success' });
      logger.debug(`Circuit breaker - Éxito: ${serviceName}`);
    });

    // Evento: Llamada fallida
    breaker.on('failure', (error) => {
      this.updateStats(serviceName, { type: 'failure', error });
      logger.warn(`Circuit breaker - Fallo: ${serviceName}`, { error: error.message });
    });

    // Evento: Timeout
    breaker.on('timeout', () => {
      this.updateStats(serviceName, { type: 'timeout' });
      logger.warn(`Circuit breaker - Timeout: ${serviceName}`);
    });

    // Evento: Circuit abierto
    breaker.on('open', () => {
      this.updateStats(serviceName, { type: 'open' });
      logger.error(`Circuit breaker ABIERTO: ${serviceName}`);
    });

    // Evento: Circuit semi-abierto
    breaker.on('halfOpen', () => {
      this.updateStats(serviceName, { type: 'halfOpen' });
      logger.info(`Circuit breaker SEMI-ABIERTO: ${serviceName}`);
    });

    // Evento: Circuit cerrado
    breaker.on('close', () => {
      this.updateStats(serviceName, { type: 'close' });
      logger.info(`Circuit breaker CERRADO: ${serviceName}`);
    });

    // Evento: Llamada rechazada (circuit abierto)
    breaker.on('reject', () => {
      this.updateStats(serviceName, { type: 'reject' });
      logger.warn(`Circuit breaker - Llamada rechazada: ${serviceName}`);
    });

    // Evento: Fallback ejecutado
    breaker.on('fallback', (result) => {
      this.updateStats(serviceName, { type: 'fallback' });
      logger.info(`Circuit breaker - Fallback ejecutado: ${serviceName}`);
    });
  }

  /**
   * Inicializar estadísticas para un servicio
   */
  private initializeStats(serviceName: string): void {
    this.stats.set(serviceName, {
      name: serviceName,
      state: 'closed',
      failures: 0,
      successes: 0,
      requests: 0,
      errorPercentage: 0
    });
  }

  /**
   * Actualizar estadísticas del circuit breaker
   */
  private updateStats(serviceName: string, event: { type: string; error?: Error }): void {
    const currentStats = this.stats.get(serviceName);
    if (!currentStats) return;

    const breaker = this.getBreaker(serviceName);
    if (!breaker) return;

    let updatedStats = { ...currentStats };

    // Actualizar contadores según el tipo de evento
    switch (event.type) {
      case 'success':
        updatedStats.successes++;
        updatedStats.requests++;
        break;
      case 'failure':
      case 'timeout':
        updatedStats.failures++;
        updatedStats.requests++;
        break;
      case 'reject':
        updatedStats.requests++;
        break;
      case 'open':
        updatedStats.state = 'open';
        updatedStats.nextAttempt = new Date(Date.now() + config.circuitBreaker.resetTimeout);
        break;
      case 'halfOpen':
        updatedStats.state = 'half-open';
        updatedStats.nextAttempt = undefined;
        break;
      case 'close':
        updatedStats.state = 'closed';
        updatedStats.nextAttempt = undefined;
        break;
    }

    // Calcular porcentaje de error
    if (updatedStats.requests > 0) {
      updatedStats.errorPercentage = (updatedStats.failures / updatedStats.requests) * 100;
    }

    // Actualizar estado basado en el circuit breaker real
    if (breaker.opened) {
      updatedStats.state = 'open';
    } else if (breaker.halfOpen) {
      updatedStats.state = 'half-open';
    } else {
      updatedStats.state = 'closed';
    }

    this.stats.set(serviceName, updatedStats);
  }
}
