import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
export declare const validateFactura: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateFacturaUpdate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateCliente: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const idParamSchema: Joi.ObjectSchema<any>;
export declare const paginationQuerySchema: Joi.ObjectSchema<any>;
export declare const dateRangeQuerySchema: Joi.ObjectSchema<any>;
export declare const trimestreQuerySchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map