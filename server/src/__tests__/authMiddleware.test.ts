import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole, requirePermission } from '../middlewares/rbacMiddleware';
import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import prisma from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

// Mock dependencies
jest.mock('../config/firebase', () => ({
    auth: jest.fn().mockReturnValue({
        verifyIdToken: jest.fn()
    })
}));

jest.mock('../config/prisma', () => ({
    users: {
        findUnique: jest.fn()
    },
    roles: {
        findUnique: jest.fn()
    }
}));

// Mock logger to suppress errors
jest.mock('../utils/logger', () => ({
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
}));

describe('Auth Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should throw 401 if no token provided', async () => {
        await authMiddleware(mockReq as Request, mockRes as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect((next as jest.Mock).mock.calls[0][0].statusCode).toBe(401);
    });

    it('should attach user and role if token is valid', async () => {
        mockReq.headers = { authorization: 'Bearer valid-token' };

        (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'user123' });
        (prisma.users.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' });
        (prisma.roles.findUnique as jest.Mock).mockResolvedValue({
            name: 'admin',
            permissions: { 'users.write': true }
        });

        await authMiddleware(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalledWith();
        expect((mockReq as any).user).toBeDefined();
        expect((mockReq as any).user.dbRole).toBe('admin');
        expect((mockReq as any).user.permissions).toContain('users.write');
    });
});

describe('RBAC Middleware', () => {
    let mockReq: any;
    let mockRes: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        mockReq = {
            user: { dbRole: 'user', permissions: [] }
        };
        mockRes = {};
        next = jest.fn();
    });

    it('requireRole should allow if role matches', () => {
        mockReq.user.dbRole = 'admin';
        requireRole('admin')(mockReq, mockRes as Response, next);
        expect(next).toHaveBeenCalledWith();
    });

    it('requireRole should deny if role mismatches', () => {
        mockReq.user.dbRole = 'user';
        requireRole('admin')(mockReq, mockRes as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('requirePermission should allow if permission present', () => {
        mockReq.user.permissions = ['users.read'];
        requirePermission('users.read')(mockReq, mockRes as Response, next);
        expect(next).toHaveBeenCalledWith();
    });

    it('requirePermission should deny if permission missing', () => {
        mockReq.user.permissions = [];
        requirePermission('users.read')(mockReq, mockRes as Response, next);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
});
