/**
 * 📊 SISTEMA INTEGRADO DE MONITOREO Y ALERTAS
 * 
 * Punto 10: Monitoreo y alertas completo con dashboards y métricas
 */

import { securityLogger } from './centralized-logging';
import { alertManager, healthMonitor, initializeSentry } from './sentry-alerts';

/**
 * Métricas del sistema
 */
export interface SystemMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    rate: number; // requests/second
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    slowQueries: number;
  };
  security: {
    securityViolations: number;
    authFailures: number;
    xssAttempts: number;
    cspViolations: number;
  };
  sii: {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    avgProcessingTime: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
}

/**
 * Recolector de métricas
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: SystemMetrics;
  private intervalId?: NodeJS.Timeout;
  private startTime = Date.now();

  private constructor() {
    this.metrics = this.initializeMetrics();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private initializeMetrics(): SystemMetrics {
    return {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        rate: 0
      },
      performance: {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        slowQueries: 0
      },
      security: {
        securityViolations: 0,
        authFailures: 0,
        xssAttempts: 0,
        cspViolations: 0
      },
      sii: {
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        avgProcessingTime: 0
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        uptime: 0
      }
    };
  }

  /**
   * Iniciar recolección automática de métricas
   */
  startCollection(intervalMs: number = 30000) {
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
      this.logMetrics();
      this.checkThresholds();
    }, intervalMs);

    securityLogger.logInfo('📊 Recolección de métricas iniciada', {
      action: 'METRICS_COLLECTION_STARTED',
      metadata: { interval: intervalMs }
    });
  }

  /**
   * Detener recolección de métricas
   */
  stopCollection() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    securityLogger.logInfo('📊 Recolección de métricas detenida', {
      action: 'METRICS_COLLECTION_STOPPED'
    });
  }

  /**
   * Incrementar contador de request
   */
  incrementRequest(success: boolean = true) {
    this.metrics.requests.total++;
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }
  }

  /**
   * Registrar tiempo de respuesta
   */
  recordResponseTime(duration: number) {
    // Implementación simplificada del cálculo de P95
    this.metrics.performance.avgResponseTime = 
      (this.metrics.performance.avgResponseTime + duration) / 2;
    
    if (duration > this.metrics.performance.p95ResponseTime) {
      this.metrics.performance.p95ResponseTime = duration;
    }

    // Alerta de rendimiento si es muy lento
    if (duration > 5000) { // 5 segundos
      this.metrics.performance.slowQueries++;
      alertManager.alertPerformance('slow_response', duration, 5000, {
        endpoint: 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Registrar violación de seguridad
   */
  recordSecurityViolation(type: 'xss' | 'csp' | 'auth' | 'general') {
    this.metrics.security.securityViolations++;
    
    switch (type) {
      case 'xss':
        this.metrics.security.xssAttempts++;
        break;
      case 'csp':
        this.metrics.security.cspViolations++;
        break;
      case 'auth':
        this.metrics.security.authFailures++;
        break;
    }

    securityLogger.logSecurityViolation(`security_violation_${type}`, 'medium', {
      metadata: { type, timestamp: new Date().toISOString() }
    });
  }

  /**
   * Registrar transacción SII
   */
  recordSIITransaction(success: boolean, processingTime: number) {
    this.metrics.sii.totalTransactions++;
    
    if (success) {
      this.metrics.sii.successfulTransactions++;
    } else {
      this.metrics.sii.failedTransactions++;
    }

    this.metrics.sii.avgProcessingTime = 
      (this.metrics.sii.avgProcessingTime + processingTime) / 2;
  }

  /**
   * Recopilar métricas del sistema
   */
  private collectSystemMetrics() {
    // Calcular uptime
    this.metrics.system.uptime = Date.now() - this.startTime;

    // Calcular rate de requests (últimos 5 minutos)
    this.metrics.requests.rate = this.metrics.requests.total / (this.metrics.system.uptime / 1000);

    // Métricas de memoria (Node.js)
    const memUsage = process.memoryUsage();
    this.metrics.system.memoryUsage = memUsage.heapUsed / memUsage.heapTotal;

    // CPU usage simplificado
    this.metrics.system.cpuUsage = process.cpuUsage().user / 1000000; // microsegundos a segundos

    // Disk usage placeholder (requeriría fs stats en producción)
    this.metrics.system.diskUsage = 0.5; // 50% placeholder
  }

  /**
   * Log de métricas
   */
  private logMetrics() {
    securityLogger.logInfo('📊 Métricas del sistema', {
      action: 'SYSTEM_METRICS',
      metadata: this.metrics
    });
  }

  /**
   * Verificar umbrales y enviar alertas
   */
  private checkThresholds() {
    // Error rate alto (más del 10%)
    const errorRate = this.metrics.requests.errors / this.metrics.requests.total;
    if (errorRate > 0.1) {
      alertManager.alertCritical(`Error rate alto: ${(errorRate * 100).toFixed(2)}%`, undefined, {
        errorRate,
        totalRequests: this.metrics.requests.total,
        errors: this.metrics.requests.errors
      });
    }

    // Memoria alta (más del 90%)
    if (this.metrics.system.memoryUsage > 0.9) {
      alertManager.alertCritical(`Uso de memoria crítico: ${(this.metrics.system.memoryUsage * 100).toFixed(2)}%`, undefined, {
        memoryUsage: this.metrics.system.memoryUsage
      });
    }

    // SII failure rate alto (más del 20%)
    const siiFailureRate = this.metrics.sii.failedTransactions / this.metrics.sii.totalTransactions;
    if (siiFailureRate > 0.2) {
      alertManager.alertSII('high_failure_rate', 'error', {
        failureRate: siiFailureRate,
        totalTransactions: this.metrics.sii.totalTransactions,
        failedTransactions: this.metrics.sii.failedTransactions
      });
    }

    // Violaciones de seguridad frecuentes (más de 10 por hora)
    const violationsPerHour = this.metrics.security.securityViolations / (this.metrics.system.uptime / 3600000);
    if (violationsPerHour > 10) {
      alertManager.alertSecurity('high_violation_rate', 'high', {
        violationsPerHour,
        totalViolations: this.metrics.security.securityViolations
      });
    }
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();
    
    securityLogger.logInfo('📊 Métricas reseteadas', {
      action: 'METRICS_RESET'
    });
  }
}

/**
 * Dashboard de monitoreo
 */
export class MonitoringDashboard {
  private metricsCollector = MetricsCollector.getInstance();

  /**
   * Generar reporte HTML del dashboard
   */
  generateHTMLReport(): string {
    const metrics = this.metricsCollector.getMetrics();
    const uptime = new Date(metrics.system.uptime).toISOString().substr(11, 8);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>📊 Dashboard de Monitoreo - Facturación Autónomos</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .status-good { color: #16a34a; }
        .status-warning { color: #ca8a04; }
        .status-error { color: #dc2626; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        h1, h2 { color: #1f2937; }
        .timestamp { color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Dashboard de Monitoreo</h1>
        <p class="timestamp">Última actualización: ${new Date().toLocaleString()}</p>
        
        <div class="grid">
            <div class="card">
                <h2>🚀 Requests</h2>
                <div class="metric">
                    <div class="metric-value ${metrics.requests.total > 0 ? 'status-good' : ''}">${metrics.requests.total}</div>
                    <div class="metric-label">Total</div>
                </div>
                <div class="metric">
                    <div class="metric-value status-good">${metrics.requests.success}</div>
                    <div class="metric-label">Exitosos</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.requests.errors > 0 ? 'status-error' : 'status-good'}">${metrics.requests.errors}</div>
                    <div class="metric-label">Errores</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${metrics.requests.rate.toFixed(2)}/s</div>
                    <div class="metric-label">Rate</div>
                </div>
            </div>

            <div class="card">
                <h2>⚡ Rendimiento</h2>
                <div class="metric">
                    <div class="metric-value ${metrics.performance.avgResponseTime > 1000 ? 'status-warning' : 'status-good'}">${metrics.performance.avgResponseTime.toFixed(0)}ms</div>
                    <div class="metric-label">Tiempo Promedio</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.performance.p95ResponseTime > 2000 ? 'status-error' : 'status-good'}">${metrics.performance.p95ResponseTime.toFixed(0)}ms</div>
                    <div class="metric-label">P95</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.performance.slowQueries > 0 ? 'status-warning' : 'status-good'}">${metrics.performance.slowQueries}</div>
                    <div class="metric-label">Queries Lentas</div>
                </div>
            </div>

            <div class="card">
                <h2>🛡️ Seguridad</h2>
                <div class="metric">
                    <div class="metric-value ${metrics.security.securityViolations > 0 ? 'status-error' : 'status-good'}">${metrics.security.securityViolations}</div>
                    <div class="metric-label">Violaciones</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.security.authFailures > 0 ? 'status-warning' : 'status-good'}">${metrics.security.authFailures}</div>
                    <div class="metric-label">Auth Failures</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.security.xssAttempts > 0 ? 'status-error' : 'status-good'}">${metrics.security.xssAttempts}</div>
                    <div class="metric-label">XSS Attempts</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.security.cspViolations > 0 ? 'status-warning' : 'status-good'}">${metrics.security.cspViolations}</div>
                    <div class="metric-label">CSP Violations</div>
                </div>
            </div>

            <div class="card">
                <h2>🏛️ SII Transacciones</h2>
                <div class="metric">
                    <div class="metric-value">${metrics.sii.totalTransactions}</div>
                    <div class="metric-label">Total</div>
                </div>
                <div class="metric">
                    <div class="metric-value status-good">${metrics.sii.successfulTransactions}</div>
                    <div class="metric-label">Exitosas</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.sii.failedTransactions > 0 ? 'status-error' : 'status-good'}">${metrics.sii.failedTransactions}</div>
                    <div class="metric-label">Fallidas</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${metrics.sii.avgProcessingTime.toFixed(0)}ms</div>
                    <div class="metric-label">Tiempo Promedio</div>
                </div>
            </div>

            <div class="card">
                <h2>💻 Sistema</h2>
                <div class="metric">
                    <div class="metric-value ${metrics.system.cpuUsage > 80 ? 'status-error' : metrics.system.cpuUsage > 60 ? 'status-warning' : 'status-good'}">${(metrics.system.cpuUsage).toFixed(1)}%</div>
                    <div class="metric-label">CPU</div>
                </div>
                <div class="metric">
                    <div class="metric-value ${metrics.system.memoryUsage > 0.9 ? 'status-error' : metrics.system.memoryUsage > 0.7 ? 'status-warning' : 'status-good'}">${(metrics.system.memoryUsage * 100).toFixed(1)}%</div>
                    <div class="metric-label">Memoria</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${uptime}</div>
                    <div class="metric-label">Uptime</div>
                </div>
            </div>

            <div class="card">
                <h2>💚 Health Status</h2>
                ${this.generateHealthStatusHTML()}
            </div>
        </div>
    </div>
    
    <script>
        // Auto-refresh cada 30 segundos
        setTimeout(() => window.location.reload(), 30000);
    </script>
</body>
</html>`;
  }

  /**
   * Generar HTML del estado de salud
   */
  private generateHealthStatusHTML(): string {
    const healthStatus = healthMonitor.performHealthCheck();
    const services = healthStatus.services;

    let html = `<div class="metric">
        <div class="metric-value ${healthStatus.status === 'healthy' ? 'status-good' : healthStatus.status === 'degraded' ? 'status-warning' : 'status-error'}">${healthStatus.status.toUpperCase()}</div>
        <div class="metric-label">Estado General</div>
    </div>`;

    Object.entries(services).forEach(([serviceName, service]: [string, any]) => {
      html += `<div class="metric">
        <div class="metric-value ${service.status === 'up' ? 'status-good' : service.status === 'degraded' ? 'status-warning' : 'status-error'}">${service.status.toUpperCase()}</div>
        <div class="metric-label">${serviceName}</div>
      </div>`;
    });

    return html;
  }

  /**
   * Generar reporte JSON
   */
  generateJSONReport(): string {
    const metrics = this.metricsCollector.getMetrics();
    const healthStatus = healthMonitor.performHealthCheck();

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics,
      health: healthStatus
    }, null, 2);
  }
}

/**
 * Clase principal del sistema de monitoreo
 */
export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private metricsCollector = MetricsCollector.getInstance();
  private dashboard = new MonitoringDashboard();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  /**
   * Inicializar sistema completo
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // Inicializar Sentry
    initializeSentry();

    // Iniciar recolección de métricas
    this.metricsCollector.startCollection();

    // Registrar servicios principales
    healthMonitor.registerServiceStatus('facturacion-service', 'up');
    healthMonitor.registerServiceStatus('auth-service', 'up');
    healthMonitor.registerServiceStatus('tax-calculator', 'up');
    healthMonitor.registerServiceStatus('sii-integration', 'up');

    this.isInitialized = true;

    securityLogger.logInfo('📊 Sistema de monitoreo inicializado', {
      action: 'MONITORING_SYSTEM_INITIALIZED',
      metadata: {
        sentryEnabled: Boolean(process.env.SENTRY_DSN),
        metricsCollectionEnabled: true,
        servicesRegistered: ['facturacion-service', 'auth-service', 'tax-calculator', 'sii-integration']
      }
    });
  }

  /**
   * Shutdown del sistema
   */
  shutdown() {
    this.metricsCollector.stopCollection();
    
    securityLogger.logInfo('📊 Sistema de monitoreo detenido', {
      action: 'MONITORING_SYSTEM_SHUTDOWN'
    });
  }

  /**
   * Obtener dashboard HTML
   */
  getDashboard(): string {
    return this.dashboard.generateHTMLReport();
  }

  /**
   * Obtener métricas en JSON
   */
  getMetricsJSON(): string {
    return this.dashboard.generateJSONReport();
  }

  /**
   * Middleware para Express - registrar requests
   */
  getExpressMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      // Registrar request
      this.metricsCollector.incrementRequest(true);

      // Cuando termine la respuesta
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.metricsCollector.recordResponseTime(duration);

        // Si es error, registrarlo
        if (res.statusCode >= 400) {
          this.metricsCollector.incrementRequest(false);
        }

        securityLogger.logInfo(`HTTP: ${req.method} ${req.path}`, {
          action: 'HTTP_REQUEST',
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip
          }
        });
      });

      next();
    };
  }
}

// Instancia singleton para uso global
export const monitoringSystem = MonitoringSystem.getInstance();
export const metricsCollector = MetricsCollector.getInstance();

export default {
  MonitoringSystem,
  monitoringSystem,
  MetricsCollector,
  metricsCollector,
  MonitoringDashboard,
  alertManager,
  healthMonitor
};
