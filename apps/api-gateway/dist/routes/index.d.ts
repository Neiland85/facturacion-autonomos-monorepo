import { Express } from 'express';
import { CircuitBreakerManager } from '../services/circuit-breaker.service';
import { ServiceRegistry } from '../services/service-registry.service';
export declare const setupRoutes: (app: Express, serviceRegistry: ServiceRegistry, circuitBreaker: CircuitBreakerManager) => void;
//# sourceMappingURL=index.d.ts.map