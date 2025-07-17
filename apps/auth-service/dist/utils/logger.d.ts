import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logAuthAttempt: (email: string, success: boolean, ip?: string) => void;
export declare const logUserRegistration: (email: string, ip?: string) => void;
export declare const logPasswordReset: (email: string, ip?: string) => void;
export declare const logSecurityEvent: (event: string, userId?: string, details?: any) => void;
export declare const logError: (error: Error, context?: any) => void;
//# sourceMappingURL=logger.d.ts.map