import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal, activeConnections } from '../config/prometheus';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Increment active connections
    activeConnections.inc();

    // Track response
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        const method = req.method;
        const statusCode = res.statusCode.toString();

        // Record metrics
        httpRequestDuration.observe(
            { method, route, status_code: statusCode },
            duration
        );

        httpRequestTotal.inc({
            method,
            route,
            status_code: statusCode,
        });

        // Decrement active connections
        activeConnections.dec();
    });

    next();
};
