
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role?: string;
      };
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}

export { };

