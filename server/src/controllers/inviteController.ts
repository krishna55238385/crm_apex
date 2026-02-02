import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';

export const getInvites = asyncHandler(async (req: Request, res: Response) => {
    const invites = await prisma.invites.findMany({
        orderBy: { invite_date: 'desc' }
    });
    res.json(invites);
});

export const createInvite = asyncHandler(async (req: Request, res: Response) => {
    const { email, role, invitedBy } = req.body;

    const existingUser = await prisma.users.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new AppError('User with this email already exists', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const newInvite = await prisma.invites.create({
        data: {
            id: crypto.randomUUID(),
            email,
            role,
            status: 'Pending',
            invited_by: invitedBy || 'System',
            invite_date: new Date(),
            expiry_date: expiryDate,
            token
        } as any
    });

    console.log(`[MOCK EMAIL] To: ${email}, Link: https://app.apexai.com/join?token=${token}`);

    res.json({ message: 'Invite sent', id: newInvite.id });
});

export const deleteInvite = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.invites.delete({ where: { id: String(id) } });
    res.json({ message: 'Invite cancelled' });
});
