import { Request, Response } from 'express';
export declare class ReportesController {
    getTrimestral(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAnual(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getVentas(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getGastos(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    exportar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=reportes.d.ts.map