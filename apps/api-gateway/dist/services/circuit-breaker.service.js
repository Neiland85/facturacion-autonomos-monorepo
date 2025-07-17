"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerManager = void 0;
const opossum_1 = __importDefault(require("opossum"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class CircuitBreakerManager {
    constructor() {
        this.breakers = new Map();
        this.stats = new Map();
    }
    createBreaker(serviceName, action, options) {
        const breakerOptions = {
            timeout: config_1.config.circuitBreaker.timeout,
            errorThresholdPercentage: config_1.config.circuitBreaker.errorThresholdPercentage,
            resetTimeout: config_1.config.circuitBreaker.resetTimeout,
            name: serviceName,
            ...options
        };
        const breaker = new opossum_1.default(action, breakerOptions);
        this.setupBreakerEvents(breaker, serviceName);
        this.breakers.set(serviceName, breaker);
        this.initializeStats(serviceName);
        logger_1.logger.info(`Circuit breaker creado para ${serviceName}`, breakerOptions);
        return breaker;
    }
    getBreaker(serviceName) {
        return this.breakers.get(serviceName);
    }
    async execute(serviceName, action) {
        let breaker = this.getBreaker(serviceName);
        if (!breaker) {
            breaker = this.createBreaker(serviceName, action);
        }
        try {
            const result = await breaker.fire();
            return result;
        }
        catch (error) {
            if (breaker.opened) {
                const stats = this.getStats(serviceName);
                throw new Error(`Circuit breaker abierto para ${serviceName}. Siguiente intento: ${stats?.nextAttempt}`);
            }
            throw error;
        }
    }
    getStats(serviceName) {
        return this.stats.get(serviceName);
    }
    getAllStats() {
        return Array.from(this.stats.values());
    }
    forceOpen(serviceName) {
        const breaker = this.getBreaker(serviceName);
        if (breaker) {
            breaker.open();
            logger_1.logger.warn(`Circuit breaker forzado a abierto: ${serviceName}`);
        }
    }
    forceClose(serviceName) {
        const breaker = this.getBreaker(serviceName);
        if (breaker) {
            breaker.close();
            logger_1.logger.info(`Circuit breaker forzado a cerrado: ${serviceName}`);
        }
    }
    shutdown() {
        this.breakers.forEach((breaker, serviceName) => {
            breaker.shutdown();
            logger_1.logger.info(`Circuit breaker cerrado: ${serviceName}`);
        });
        this.breakers.clear();
        this.stats.clear();
    }
    setupBreakerEvents(breaker, serviceName) {
        breaker.on('success', (result) => {
            this.updateStats(serviceName, { type: 'success' });
            logger_1.logger.debug(`Circuit breaker - Éxito: ${serviceName}`);
        });
        breaker.on('failure', (error) => {
            this.updateStats(serviceName, { type: 'failure', error });
            logger_1.logger.warn(`Circuit breaker - Fallo: ${serviceName}`, { error: error.message });
        });
        breaker.on('timeout', () => {
            this.updateStats(serviceName, { type: 'timeout' });
            logger_1.logger.warn(`Circuit breaker - Timeout: ${serviceName}`);
        });
        breaker.on('open', () => {
            this.updateStats(serviceName, { type: 'open' });
            logger_1.logger.error(`Circuit breaker ABIERTO: ${serviceName}`);
        });
        breaker.on('halfOpen', () => {
            this.updateStats(serviceName, { type: 'halfOpen' });
            logger_1.logger.info(`Circuit breaker SEMI-ABIERTO: ${serviceName}`);
        });
        breaker.on('close', () => {
            this.updateStats(serviceName, { type: 'close' });
            logger_1.logger.info(`Circuit breaker CERRADO: ${serviceName}`);
        });
        breaker.on('reject', () => {
            this.updateStats(serviceName, { type: 'reject' });
            logger_1.logger.warn(`Circuit breaker - Llamada rechazada: ${serviceName}`);
        });
        breaker.on('fallback', (result) => {
            this.updateStats(serviceName, { type: 'fallback' });
            logger_1.logger.info(`Circuit breaker - Fallback ejecutado: ${serviceName}`);
        });
    }
    initializeStats(serviceName) {
        this.stats.set(serviceName, {
            name: serviceName,
            state: 'closed',
            failures: 0,
            successes: 0,
            requests: 0,
            errorPercentage: 0
        });
    }
    updateStats(serviceName, event) {
        const currentStats = this.stats.get(serviceName);
        if (!currentStats)
            return;
        const breaker = this.getBreaker(serviceName);
        if (!breaker)
            return;
        let updatedStats = { ...currentStats };
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
                updatedStats.nextAttempt = new Date(Date.now() + config_1.config.circuitBreaker.resetTimeout);
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
        if (updatedStats.requests > 0) {
            updatedStats.errorPercentage = (updatedStats.failures / updatedStats.requests) * 100;
        }
        if (breaker.opened) {
            updatedStats.state = 'open';
        }
        else if (breaker.halfOpen) {
            updatedStats.state = 'half-open';
        }
        else {
            updatedStats.state = 'closed';
        }
        this.stats.set(serviceName, updatedStats);
    }
}
exports.CircuitBreakerManager = CircuitBreakerManager;
//# sourceMappingURL=circuit-breaker.service.js.map