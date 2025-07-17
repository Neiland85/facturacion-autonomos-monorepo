import { AxiosResponse } from 'axios';
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
export declare class ServiceRegistry {
    private services;
    private healthStatus;
    private healthCheckInterval;
    constructor();
    registerService(name: string, serviceConfig: ServiceConfig): void;
    getService(name: string): ServiceConfig | undefined;
    getServiceHealth(name: string): ServiceHealth | undefined;
    getAllServices(): Map<string, ServiceConfig>;
    getAllHealthStatus(): Map<string, ServiceHealth>;
    callService(serviceName: string, method: string, path: string, data?: any, headers?: Record<string, string>): Promise<AxiosResponse>;
    checkServiceHealth(serviceName: string): Promise<ServiceHealth>;
    performHealthChecks(): Promise<void>;
    registerAllServices(): void;
    private updateServiceMetrics;
    private generateRequestId;
    private delay;
    destroy(): void;
}
//# sourceMappingURL=service-registry.service.d.ts.map