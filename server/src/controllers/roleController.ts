import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await prisma.roles.findMany({
        orderBy: { name: 'asc' }
    });
    res.json(roles);
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, permissions } = req.body;

    const normalizedName = name.toLowerCase().replace(/\s+/g, '_');

    // Check availability (Prisma throws P2002 on unique constraint violation, but we can check specifically)
    const existing = await prisma.roles.findUnique({ where: { name: normalizedName } });
    if (existing) {
        throw new AppError('Role already exists', 400);
    }

    const newRole = await prisma.roles.create({
        data: {
            id: crypto.randomUUID(),
            name: normalizedName,
            description,
            permissions: permissions || {}, // Prisma handles object -> JSON
            is_system: false
        }
    });

    res.json({ message: 'Role created', id: newRole.id, name: normalizedName });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permissions, description } = req.body;

    await prisma.roles.update({
        where: { id: id as string },
        data: {
            description,
            permissions: permissions ?? undefined
        }
    });

    res.json({ message: 'Role updated' });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const role = await prisma.roles.findUnique({ where: { id: id as string } });
    if (!role) throw new AppError('Role not found', 404);
    if (role.is_system) throw new AppError('Cannot delete system roles', 403);

    // Check users usage (Note: users table has 'role' column which matches role NAME, not ID in legacy schema?)
    // Checking previous controller: `WHERE role = (SELECT name FROM roles WHERE id = ?)`
    // So users.role stores the role NAME.
    const userCount = await prisma.users.count({
        where: { role: role.name as any }
    });

    if (userCount > 0) {
        throw new AppError('Cannot delete role assigned to users.', 400);
    }

    await prisma.roles.delete({ where: { id: id as string } });
    res.json({ message: 'Role deleted' });
});
