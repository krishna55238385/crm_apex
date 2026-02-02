import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { AppError } from './errorHandler';
import { Permission } from '../types/permissions';

export const requireRole = (requiredRole: string | string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.dbRole) {
            return next(new AppError('Unauthorized access', 403));
        }

        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        if (!roles.includes(req.user.dbRole)) {
            return next(new AppError('Forbidden: Insufficient privileges', 403));
        }

        next();
    };
};

export const requirePermission = (permission: Permission) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // DEV MODE BYPASS - Allow all permissions in development
        if (process.env.NODE_ENV === 'development') {
            return next();
        }

        if (!req.user || !req.user.permissions) {
            return next(new AppError('Unauthorized access', 403));
        }

        // Super admins bypass permission checks? 
        // Best practice: explicit permissions even for admins, 
        // but for now let's say 'super_admin' has all access implicitly if needed.
        if (req.user.dbRole === 'super_admin') {
            return next();
        }

        if (!req.user.permissions.includes(permission)) {
            return next(new AppError(`Forbidden: Missing permission ${permission}`, 403));
        }

        next();
    };
};
