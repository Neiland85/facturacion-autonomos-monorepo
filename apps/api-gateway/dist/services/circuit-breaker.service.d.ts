import CircuitBreaker from 'opossum';
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
export declare class CircuitBreakerManager {
    private breakers;
    private stats;
    constructor();
    createBreaker<T>(serviceName: string, action: (...args: any[]) => Promise<T>, options?: Partial<CircuitBreakerOptions>): CircuitBreaker;
    getBreaker(serviceName: string): CircuitBreaker | undefined;
    execute<T>(serviceName: string, action: () => Promise<T>): Promise<T>;
    getStats(serviceName: string): CircuitBreakerStats | undefined;
    getAllStats(): CircuitBreakerStats[];
    forceOpen(serviceName: string): void;
    forceClose(serviceName: string): void;
    shutdown(): void;
    private setupBreakerEvents;
    private initializeStats;
    private updateStats;
}
//# sourceMappingURL=circuit-breaker.service.d.ts.map