import { Request, Response } from 'express';
declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
    private generateTokens;
    private excludePassword;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=auth.controller.d.ts.map