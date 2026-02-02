import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import prisma from '../config/prisma';
import { AppError } from './errorHandler';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
    user?: admin.auth.DecodedIdToken & {
        dbRole?: string;
        permissions?: string[];
    };
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        // DEV MODE BYPASS
        if ((!authHeader || !authHeader.startsWith('Bearer ')) && process.env.NODE_ENV === 'development') {
            const mockUser = await prisma.users.findFirst();
            if (mockUser) {
                (req as AuthRequest).user = {
                    uid: mockUser.id,
                    aud: 'mock',
                    auth_time: Date.now(),
                    exp: Date.now() + 3600,
                    firebase: { identities: {}, sign_in_provider: 'mock' },
                    iat: Date.now(),
                    iss: 'mock',
                    sub: mockUser.id,
                    dbRole: mockUser.role,
                    // Grant all permissions in dev mode to bypass permission checks
                    permissions: [
                        'users.read', 'users.write', 'users.delete',
                        'leads.read', 'leads.write', 'leads.delete',
                        'deals.read', 'deals.write', 'deals.delete',
                        'tasks.read', 'tasks.write', 'tasks.delete',
                        'reports.read', 'reports.write',
                        'settings.read', 'settings.write',
                        'workflows.read', 'workflows.write',
                        'analytics.read'
                    ]
                };
                logger.info(`[Auth] Dev mode: Bypassing auth with mock user ${mockUser.email} (ALL PERMISSIONS GRANTED)`);
                return next();
            }
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Fetch User Role from DB
            const dbUser = await prisma.users.findUnique({
                where: { id: decodedToken.uid },
                select: { role: true }
            });

            let permissions: string[] = [];
            let roleName = 'user';

            if (dbUser) {
                roleName = dbUser.role;
                // Fetch Permissions for this role
                const dbRole = await prisma.roles.findUnique({
                    where: { name: dbUser.role }
                });

                if (dbRole && dbRole.permissions) {
                    // Assuming permissions is stored as { "user.read": true } json
                    // Convert to array of enabled permissions
                    const permsObj = dbRole.permissions as Record<string, boolean>;
                    permissions = Object.keys(permsObj).filter(k => permsObj[k] === true);
                }
            }

            (req as AuthRequest).user = {
                ...decodedToken,
                dbRole: roleName,
                permissions
            };

            next();
        } catch (error) {
            logger.warn(`Token verification failed: ${error}`);
            throw new AppError('Invalid or expired token', 401);
        }

    } catch (error) {
        next(error);
    }
};
