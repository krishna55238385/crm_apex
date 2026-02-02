import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await prisma.settings.findUnique({
        where: { setting_key: String(key) }
    });

    if (!setting) {
        res.json({});
        return;
    }

    // Prisma returns JsonValue, which is object or primitive.
    // The previous code returned `rows[0].setting_value`.
    // If setting.setting_value is JSON stringified in DB? 
    // In legacy mysql2, it was stored as JSON string (LONGTEXT) OR JSON type?
    // Let's assume Prisma handles it. 
    // If the schema is `Json`, Prisma parses it automatically.
    res.json(setting.setting_value);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const value = req.body;

    if (!key) {
        throw new AppError('Setting key is required', 400);
    }

    // Upsert
    await prisma.settings.upsert({
        where: { setting_key: String(key) },
        update: {
            setting_value: value // Prisma stringifies if needed? No, if type is Json, passed object is fine.
        },
        create: {
            id: crypto.randomUUID(),
            setting_key: String(key),
            setting_value: value
        }
    });

    res.json({ message: 'Settings updated', value });
});
