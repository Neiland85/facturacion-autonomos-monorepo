"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.healthStatus = new Map();
        Object.entries(config_1.config.services).forEach(([name, serviceConfig]) => {
            this.registerService(name, serviceConfig);
        });
        this.healthCheckInterval = setInterval(() => this.performHealthChecks(), config_1.config.monitoring.healthCheckInterval);
    }
    registerService(name, serviceConfig) {
        this.services.set(name, serviceConfig);
        this.healthStatus.set(name, {
            name,
            status: 'healthy',
            responseTime: 0,
            lastCheck: new Date(),
            errorCount: 0,
            successCount: 0
        });
        logger_1.logger.info(`Servicio registrado: ${name}`, { url: serviceConfig.url });
    }
    getService(name) {
        return this.services.get(name);
    }
    getServiceHealth(name) {
        return this.healthStatus.get(name);
    }
    getAllServices() {
        return this.services;
    }
    getAllHealthStatus() {
        return this.healthStatus;
    }
    async callService(serviceName, method, path, data, headers) {
        const service = this.getService(serviceName);
        if (!service) {
            throw new Error(`Servicio no encontrado: ${serviceName}`);
        }
        const url = `${service.url}${path}`;
        const startTime = Date.now();
        const requestConfig = {
            method: method,
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
        let lastError;
        for (let attempt = 1; attempt <= service.retries; attempt++) {
            try {
                const response = await (0, axios_1.default)(requestConfig);
                const duration = Date.now() - startTime;
                this.updateServiceMetrics(serviceName, true, duration);
                logger_1.logger.info(`Llamada exitosa a ${serviceName}`, {
                    method,
                    path,
                    status: response.status,
                    duration: `${duration}ms`,
                    attempt
                });
                return response;
            }
            catch (error) {
                lastError = error;
                const duration = Date.now() - startTime;
                logger_1.logger.warn(`Error en llamada a ${serviceName} (intento ${attempt}/${service.retries})`, {
                    method,
                    path,
                    error: lastError.message,
                    duration: `${duration}ms`
                });
                if (attempt < service.retries) {
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        const totalDuration = Date.now() - startTime;
        this.updateServiceMetrics(serviceName, false, totalDuration);
        throw new Error(`Error en servicio ${serviceName} después de ${service.retries} intentos: ${lastError.message}`);
    }
    async checkServiceHealth(serviceName) {
        const service = this.getService(serviceName);
        if (!service) {
            throw new Error(`Servicio no encontrado: ${serviceName}`);
        }
        const startTime = Date.now();
        let health = this.healthStatus.get(serviceName);
        try {
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: `${service.url}/health`,
                timeout: 5000,
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
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            health = {
                ...health,
                status: 'unhealthy',
                responseTime,
                lastCheck: new Date(),
                errorCount: health.errorCount + 1
            };
            logger_1.logger.warn(`Health check falló para ${serviceName}`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                responseTime: `${responseTime}ms`
            });
        }
        this.healthStatus.set(serviceName, health);
        return health;
    }
    async performHealthChecks() {
        const promises = Array.from(this.services.keys()).map(serviceName => this.checkServiceHealth(serviceName).catch(error => {
            logger_1.logger.error(`Error en health check de ${serviceName}`, { error: error.message });
        }));
        await Promise.allSettled(promises);
    }
    registerAllServices() {
        logger_1.logger.info('Registrando todos los servicios', {
            count: this.services.size,
            services: Array.from(this.services.keys())
        });
    }
    updateServiceMetrics(serviceName, success, duration) {
        const health = this.healthStatus.get(serviceName);
        if (!health)
            return;
        const updatedHealth = {
            ...health,
            responseTime: duration,
            lastCheck: new Date(),
            ...(success
                ? { successCount: health.successCount + 1 }
                : { errorCount: health.errorCount + 1 })
        };
        const totalRequests = updatedHealth.successCount + updatedHealth.errorCount;
        const errorRate = updatedHealth.errorCount / totalRequests;
        if (errorRate > 0.5) {
            updatedHealth.status = 'unhealthy';
        }
        else if (errorRate > 0.2) {
            updatedHealth.status = 'degraded';
        }
        else {
            updatedHealth.status = 'healthy';
        }
        this.healthStatus.set(serviceName, updatedHealth);
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
    }
}
exports.ServiceRegistry = ServiceRegistry;
//# sourceMappingURL=service-registry.service.js.map