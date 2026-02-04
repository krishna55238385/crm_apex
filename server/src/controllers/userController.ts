import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.users.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            role: true,
            status: true,
            mfa_enabled: true,
            last_active: true,
            primary_mfa_method: true,
            last_mfa_verification: true,
            notification_preferences: true
        }
    });

    // Remap for frontend camelCase if needed, or rely on frontend to adapt.
    // Frontend expects camelCase 'avatarUrl', etc.
    const mappedUsers = users.map(u => ({
        ...u,
        avatarUrl: u.avatar_url,
        mfaEnabled: u.mfa_enabled,
        lastActive: u.last_active,
        primaryMfaMethod: u.primary_mfa_method,
        lastMfaVerification: u.last_mfa_verification,
        notificationPreferences: u.notification_preferences
    }));

    res.json(mappedUsers);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        throw new AppError('Name is required', 400);
    }

    const updatedUser = await prisma.users.update({
        where: { id: id as string },
        data: { name },
        select: {
            id: true, name: true, email: true, avatar_url: true, role: true, status: true
        }
    });

    res.json({ ...updatedUser, avatarUrl: updatedUser.avatar_url });
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    await prisma.users.update({
        where: { id: id as string },
        data: { status } // Ensure status matches enum
    });

    res.json({ message: `User status updated to ${status}` });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if user has assigned work
    const leadsCount = await prisma.leads.count({ where: { owner_id: id as string } });
    const tasksCount = await prisma.tasks.count({ where: { assigned_to_id: id as string } });

    // If user has assigned work, auto-reassign to a super admin
    if (leadsCount > 0 || tasksCount > 0) {
        // Find a super admin to reassign work to (exclude the user being deleted)
        const systemAdmin = await prisma.users.findFirst({
            where: {
                role: 'super_admin',
                id: { not: id as string },
                status: 'Active'
            }
        });

        if (!systemAdmin) {
            res.status(400).json({
                message: 'Cannot delete user: No active super admin available to reassign work to.',
                leads: leadsCount,
                tasks: tasksCount
            });
            return;
        }

        // Reassign all leads and tasks to the super admin
        await prisma.$transaction([
            prisma.leads.updateMany({
                where: { owner_id: id as string },
                data: { owner_id: systemAdmin.id }
            }),
            prisma.tasks.updateMany({
                where: { assigned_to_id: id as string },
                data: { assigned_to_id: systemAdmin.id }
            })
        ]);
    }

    // Delete the user
    await prisma.users.delete({ where: { id: id as string } });

    res.json({
        message: 'User deleted successfully',
        reassigned: leadsCount > 0 || tasksCount > 0,
        leadsReassigned: leadsCount,
        tasksReassigned: tasksCount
    });
});

export const reassignWork = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetUserId } = req.body;

    if (!targetUserId) throw new AppError('Target user required', 400);

    /* 
       Prisma doesn't support multi-table UPDATE in one transaction seamlessly for arbitrary logic 
       without $transaction, but updateMany is separate.
    */
    await prisma.$transaction([
        prisma.leads.updateMany({
            where: { owner_id: id as string },
            data: { owner_id: targetUserId }
        }),
        prisma.tasks.updateMany({
            where: { assigned_to_id: id as string },
            data: { assigned_to_id: targetUserId }
        })
    ]);

    res.json({ message: 'Work reassigned successfully' });
});

import admin from '../config/firebase';

export const syncUser = asyncHandler(async (req: Request, res: Response) => {
    const { id, email, name, avatarUrl } = req.body;

    if (!id || !email) {
        throw new AppError('User ID and Email are required', 400);
    }

    const user = await prisma.users.upsert({
        where: { id },
        update: {
            name,
            email,
            avatar_url: avatarUrl || undefined, // Only update if provided
            last_active: new Date()
        },
        create: {
            id,
            name,
            email,
            avatar_url: avatarUrl || '',
            role: 'user', // Default is USER, unless manually promoted
            status: 'Active',
            last_active: new Date()
        }
    });

    // Sync Role to Firebase Claims
    try {
        await admin.auth().setCustomUserClaims(id, { role: user.role });
    } catch (error) {
        console.error(`Failed to set custom claims for ${id}:`, error);
        // Don't fail the request, just log it.
    }

    res.json({ message: user ? 'User synced' : 'User created' });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) throw new AppError('Role is required', 400);

    const user = await prisma.users.update({
        where: { id: id as string },
        data: { role }
    });

    try {
        await admin.auth().setCustomUserClaims(id as string, { role });
    } catch (error) {
        console.error(`Failed to update custom claims for ${id}:`, error);
    }

    res.json(user);
});
