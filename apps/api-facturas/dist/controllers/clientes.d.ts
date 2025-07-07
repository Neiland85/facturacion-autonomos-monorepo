import { Request, Response } from 'express';
export declare class ClienteController {
    getClientes(req: Request, res: Response): Promise<void>;
    getClienteById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCliente(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCliente(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCliente(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=clientes.d.ts.map