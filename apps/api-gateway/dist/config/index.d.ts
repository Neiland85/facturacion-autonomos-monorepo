export declare const config: {
    port: number;
    nodeEnv: string;
    services: {
        auth: {
            url: string;
            timeout: number;
            retries: number;
        };
        invoice: {
            url: string;
            timeout: number;
            retries: number;
        };
        client: {
            url: string;
            timeout: number;
            retries: number;
        };
        tax: {
            url: string;
            timeout: number;
            retries: number;
        };
        aeat: {
            url: string;
            timeout: number;
            retries: number;
        };
        peppol: {
            url: string;
            timeout: number;
            retries: number;
        };
        notification: {
            url: string;
            timeout: number;
            retries: number;
        };
        storage: {
            url: string;
            timeout: number;
            retries: number;
        };
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    allowedOrigins: string[];
    rateLimit: {
        max: number;
        windowMs: number;
        skipSuccessfulRequests: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        keyPrefix: string;
    };
    circuitBreaker: {
        timeout: number;
        errorThresholdPercentage: number;
        resetTimeout: number;
    };
    logging: {
        level: string;
        format: string;
        file: string;
    };
    monitoring: {
        healthCheckInterval: number;
        enableMetrics: boolean;
        enableTracing: boolean;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map