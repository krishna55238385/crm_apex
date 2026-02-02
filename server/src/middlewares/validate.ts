import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params
        });

        req.body = parsed.body;

        // Handle read-only properties in Express 5
        if (req.query && parsed.query) {
            Object.assign(req.query, parsed.query);
        }
        if (req.params && parsed.params) {
            Object.assign(req.params, parsed.params);
        }

        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation Error',
                errors: (error as any).errors
            });
        }
        next(error);
    }
};
