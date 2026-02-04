import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Global rate limiter (already exists, but we'll enhance it)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Per-user rate limiter (authenticated users)
export const perUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Higher limit for authenticated users
    message: 'Too many requests from this account, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,

    // Skip rate limiting for certain routes
    skip: (req: Request) => {
        const publicRoutes = ['/health', '/metrics', '/api-docs'];
        return publicRoutes.some(route => req.path.startsWith(route));
    },
});

// Strict rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Only 5 requests per hour
    message: 'Too many attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// API-specific rate limiters
export const apiLimiters = {
    // AI endpoints (expensive operations)
    ai: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 10,
        message: 'AI request limit exceeded. Please wait before trying again.',
        standardHeaders: true,
        legacyHeaders: false,
    }),

    // File upload endpoints
    upload: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 20,
        message: 'Upload limit exceeded. Please wait before uploading more files.',
        standardHeaders: true,
        legacyHeaders: false,
    }),

    // Search endpoints
    search: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 30,
        message: 'Search limit exceeded. Please wait before searching again.',
        standardHeaders: true,
        legacyHeaders: false,
    }),
};

console.log('✅ Enhanced rate limiters initialized');
