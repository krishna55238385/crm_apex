import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Remove potentially dangerous characters from strings
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            // Remove script tags, SQL injection attempts, etc.
            return obj
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }

        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }

        if (obj && typeof obj === 'object') {
            const sanitized: any = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }

        return obj;
    };

    // Only sanitize req.body (req.query and req.params are read-only)
    if (req.body) {
        req.body = sanitize(req.body);
    }

    next();
};

// Validation schemas for common inputs
export const commonSchemas = {
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    id: z.string().uuid(),
    name: z.string().min(1).max(255),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    url: z.string().url().max(2048),
    text: z.string().max(10000),
};

// Request size limiter
export const requestSizeLimiter = (maxSize: number = 10 * 1024 * 1024) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);

        if (contentLength > maxSize) {
            return res.status(413).json({
                error: 'Request entity too large',
                maxSize: `${maxSize / (1024 * 1024)}MB`,
            });
        }

        next();
    };
};

console.log('✅ Input validation middleware initialized');
