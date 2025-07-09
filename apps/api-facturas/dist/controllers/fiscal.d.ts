import { Request, Response } from 'express';
export declare class FiscalController {
    calcular(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTiposIVA(req: Request, res: Response): Promise<void>;
    validarNIF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=fiscal.d.ts.map