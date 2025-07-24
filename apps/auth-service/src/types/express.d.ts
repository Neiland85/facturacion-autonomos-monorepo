import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
    twoFactorPending?: boolean;
    loginAttempts?: number;
    lastLoginAttempt?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        twoFactorEnabled?: boolean;
      };
    }
  }
}

export { };

