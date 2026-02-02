import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode || 500
    });

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Handle Prisma Client Errors
    if (err.code) {
        // P2002: Unique constraint failed
        if (err.code === 'P2002') {
            const field = err.meta?.target ? err.meta.target : 'Field';
            return res.status(409).json({
                status: 'error',
                message: `Duplicate value for ${field}. This record already exists.`
            });
        }

        // P2025: Record not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'Record not found.'
            });
        }

        // P2003: Foreign key constraint failed
        if (err.code === 'P2003') {
            const field = err.meta?.field_name ? err.meta.field_name : 'Field';
            return res.status(400).json({
                status: 'error',
                message: `Invalid reference. The referenced ${field} does not exist.`
            });
        }
    }

    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', {
        message: err.message,
        stack: err.stack,
        correlationId: (req as any).id
    });

    return res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong!',
        stack: err.stack
    });
};
