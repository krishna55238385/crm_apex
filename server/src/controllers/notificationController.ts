
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    let currentUserId = req.query.userId as string;

    if (!currentUserId || currentUserId === 'undefined') {
        const user = await prisma.users.findFirst();
        currentUserId = user?.id || '';
    }

    if (!currentUserId) {
        res.json([]);
        return;
    }

    const notifications = await prisma.notifications.findMany({
        where: { user_id: currentUserId },
        orderBy: { created_at: 'desc' }
    });

    const formattedNotifications = notifications.map(n => ({
        id: n.id,
        title: n.title,
        description: n.message,
        timestamp: n.created_at,
        type: n.type,
        isRead: Boolean(n.is_read)
    }));

    res.json(formattedNotifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.notifications.update({
        where: { id: String(id) },
        data: { is_read: true }
    });
    res.json({ success: true });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    // Again, need user ID context. accessing first user.
    const user = await prisma.users.findFirst();
    const currentUserId = user?.id;

    if (currentUserId) {
        await prisma.notifications.updateMany({
            where: { user_id: currentUserId },
            data: { is_read: true }
        });
    }
    res.json({ success: true });
});
