import winston from 'winston';
export declare const logger: winston.Logger;
export declare const loggerStream: {
    write: (message: string) => void;
};
export declare const logRequest: (req: any, res: any, responseTime: number) => void;
export declare const logError: (error: Error, req?: any) => void;
export declare const logServiceCall: (serviceName: string, method: string, url: string, duration: number, success: boolean) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map