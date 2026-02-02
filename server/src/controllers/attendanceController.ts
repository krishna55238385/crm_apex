import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';

export const getAttendance = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await prisma.attendance.findMany({
        include: {
            users: true
        },
        orderBy: { date: 'desc' }
    });

    const mapped = attendance.map(a => ({
        id: a.id,
        date: a.date,
        status: a.status,
        checkInTime: a.check_in_time,
        checkOutTime: a.check_out_time,
        workFromHome: Boolean(a.work_from_home),
        notes: a.notes,
        user: a.users ? {
            id: a.users.id,
            name: a.users.name,
            avatarUrl: a.users.avatar_url,
            role: a.users.role
        } : null
    }));

    res.json(mapped);
});

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) throw new AppError('User ID required', 400);

    // Check if already checked in today
    // To be safe with timezones, we can check if there's an entry where 'date' matches strict current date.
    // If 'date' in DB is just a Date object (midnight), we compare against simple date ISO string matching.
    // Prisma/Postgres/MySQL date handling can be tricky.
    // Let's assume `date` is stored as Date (YYYY-MM-DD 00:00:00).
    // We construct a range for "Today". Or if column is DATE type, exact match.

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
        where: {
            user_id: userId,
            date: {
                gte: todayStart,
                lte: todayEnd
            }
        }
    });

    if (existing) {
        throw new AppError('Already checked in today', 400);
    }

    await prisma.attendance.create({
        data: {
            id: crypto.randomUUID(),
            user_id: userId,
            date: new Date(), // Prisma maps to DATE column (truncates time if type is DATE)
            status: 'Present',
            check_in_time: new Date()
        }
    });

    res.json({ message: 'Checked in successfully' });
});

export const checkOut = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) throw new AppError('User ID required', 400);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find the record
    const record = await prisma.attendance.findFirst({
        where: {
            user_id: userId,
            date: {
                gte: todayStart,
                lte: todayEnd
            }
        }
    });

    if (!record) {
        throw new AppError('No check-in found for today', 404);
    }

    await prisma.attendance.update({
        where: { id: record.id },
        data: {
            check_out_time: new Date()
        }
    });

    res.json({ message: 'Checked out successfully' });
});
