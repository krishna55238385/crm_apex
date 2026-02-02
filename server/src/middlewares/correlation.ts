import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Check if upstream service passed an ID (e.g. Nginx)
    const existingId = req.headers['x-request-id'] as string;

    // Generate or Reuse
    const correlationId = existingId || crypto.randomUUID();

    // Attach to Request object for Logger/Controllers
    req.id = correlationId;

    // Return to Client for debugging
    res.setHeader('X-Request-ID', correlationId);

    next();
};
