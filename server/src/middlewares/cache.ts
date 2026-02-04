import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

/**
 * Cache middleware for GET requests
 * Usage: router.get('/endpoint', cacheMiddleware(300), handler)
 */
export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key from URL and query params
        const cacheKey = `api:${req.originalUrl}`;

        try {
            // Try to get from cache
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(cached);
            }

            // Cache miss - continue to handler
            res.setHeader('X-Cache', 'MISS');

            // Override res.json to cache the response
            const originalJson = res.json.bind(res);
            res.json = function (body: any) {
                // Cache the response
                cacheService.set(cacheKey, body, ttl).catch(console.error);
                return originalJson(body);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = async (pattern: string) => {
    await cacheService.delPattern(pattern);
};
