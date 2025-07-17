import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface ServiceConfig {
  url: string;
  timeout: number;
  retries: number;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
  successCount: number;
}

export class ServiceRegistry {
  private services: Map<string, ServiceConfig>;
  private healthStatus: Map<string, ServiceHealth>;
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    this.services = new Map();
    this.healthStatus = new Map();
    
    // Registrar servicios desde configuración
    Object.entries(config.services).forEach(([name, serviceConfig]) => {
      this.registerService(name, serviceConfig);
    });

    // Iniciar health checks periódicos
    this.healthCheckInterval = setInterval(
      () => this.performHealthChecks(),
      config.monitoring.healthCheckInterval
    );
  }

  /**
   * Registrar un nuevo servicio
   */
  registerService(name: string, serviceConfig: ServiceConfig): void {
    this.services.set(name, serviceConfig);
    
    // Inicializar estado de salud
    this.healthStatus.set(name, {
      name,
      status: 'healthy',
      responseTime: 0,
      lastCheck: new Date(),
      errorCount: 0,
      successCount: 0
    });

    logger.info(`Servicio registrado: ${name}`, { url: serviceConfig.url });
  }

  /**
   * Obtener configuración de servicio
   */
  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  /**
   * Obtener estado de salud de servicio
   */
  getServiceHealth(name: string): ServiceHealth | undefined {
    return this.healthStatus.get(name);
  }

  /**
   * Obtener todos los servicios registrados
   */
  getAllServices(): Map<string, ServiceConfig> {
    return this.services;
  }

  /**
   * Obtener estado de salud de todos los servicios
   */
  getAllHealthStatus(): Map<string, ServiceHealth> {
    return this.healthStatus;
  }

  /**
   * Realizar llamada a servicio con retry automático
   */
  async callService(
    serviceName: string,
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<AxiosResponse> {
    const service = this.getService(serviceName);
    if (!service) {
      throw new Error(`Servicio no encontrado: ${serviceName}`);
    }

    const url = `${service.url}${path}`;
    const startTime = Date.now();

    const requestConfig: AxiosRequestConfig = {
      method: method as any,
      url,
      timeout: service.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Service': 'api-gateway',
        'X-Request-ID': this.generateRequestId(),
        ...headers
      },
      ...(data && { data })
    };

    let lastError: Error;
    
    // Intentar con reintentos
    for (let attempt = 1; attempt <= service.retries; attempt++) {
      try {
        const response = await axios(requestConfig);
        const duration = Date.now() - startTime;
        
        // Actualizar métricas de éxito
        this.updateServiceMetrics(serviceName, true, duration);
        
        logger.info(`Llamada exitosa a ${serviceName}`, {
          method,
          path,
          status: response.status,
          duration: `${duration}ms`,
          attempt
        });

        return response;
        
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;
        
        logger.warn(`Error en llamada a ${serviceName} (intento ${attempt}/${service.retries})`, {
          method,
          path,
          error: lastError.message,
          duration: `${duration}ms`
        });

        // Si no es el último intento, esperar antes de reintentar
        if (attempt < service.retries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    // Actualizar métricas de error
    const totalDuration = Date.now() - startTime;
    this.updateServiceMetrics(serviceName, false, totalDuration);
    
    throw new Error(`Error en servicio ${serviceName} después de ${service.retries} intentos: ${lastError!.message}`);
  }

  /**
   * Realizar health check a un servicio específico
   */
  async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const service = this.getService(serviceName);
    if (!service) {
      throw new Error(`Servicio no encontrado: ${serviceName}`);
    }

    const startTime = Date.now();
    let health = this.healthStatus.get(serviceName)!;

    try {
      const response = await axios({
        method: 'GET',
        url: `${service.url}/health`,
        timeout: 5000, // Timeout más corto para health checks
        headers: {
          'X-Gateway-Health-Check': 'true'
        }
      });

      const responseTime = Date.now() - startTime;
      
      health = {
        ...health,
        status: response.status === 200 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date(),
        successCount: health.successCount + 1
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      health = {
        ...health,
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        errorCount: health.errorCount + 1
      };

      logger.warn(`Health check falló para ${serviceName}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: `${responseTime}ms`
      });
    }

    this.healthStatus.set(serviceName, health);
    return health;
  }

  /**
   * Realizar health checks a todos los servicios
   */
  async performHealthChecks(): Promise<void> {
    const promises = Array.from(this.services.keys()).map(serviceName =>
      this.checkServiceHealth(serviceName).catch(error => {
        logger.error(`Error en health check de ${serviceName}`, { error: error.message });
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Registrar todos los servicios desde configuración
   */
  registerAllServices(): void {
    logger.info('Registrando todos los servicios', {
      count: this.services.size,
      services: Array.from(this.services.keys())
    });
  }

  /**
   * Actualizar métricas de servicio
   */
  private updateServiceMetrics(serviceName: string, success: boolean, duration: number): void {
    const health = this.healthStatus.get(serviceName);
    if (!health) return;

    const updatedHealth: ServiceHealth = {
      ...health,
      responseTime: duration,
      lastCheck: new Date(),
      ...(success 
        ? { successCount: health.successCount + 1 }
        : { errorCount: health.errorCount + 1 }
      )
    };

    // Determinar estado basado en ratio de errores
    const totalRequests = updatedHealth.successCount + updatedHealth.errorCount;
    const errorRate = updatedHealth.errorCount / totalRequests;

    if (errorRate > 0.5) {
      updatedHealth.status = 'unhealthy';
    } else if (errorRate > 0.2) {
      updatedHealth.status = 'degraded';
    } else {
      updatedHealth.status = 'healthy';
    }

    this.healthStatus.set(serviceName, updatedHealth);
  }

  /**
   * Generar ID único para request
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper para reintentos
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup al destruir la instancia
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
