import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import crypto from 'crypto';

export const handleGoogleSheetLead = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, company, source, notes } = req.body;

    console.log('[Webhook] Received Payload:', JSON.stringify(req.body));

    if (!name || !email) {
        console.warn('[Webhook] Validation Failed: Missing Name or Email');
        res.status(400).json({ message: 'Name and Email are required' });
        return;
    }

    const existingLead = await prisma.leads.findFirst({
        where: { email }
    });

    if (existingLead) {
        console.warn(`[Webhook] Duplicate Lead detected: ${email} (ID: ${existingLead.id})`);
        res.status(200).json({ message: 'Lead already exists', leadId: existingLead.id });
        return;
    }

    // Assign to a default user (first admin found, logic simplified to first user)
    const defaultUser = await prisma.users.findFirst();
    const ownerId = defaultUser?.id;

    const newLead = await prisma.leads.create({
        data: {
            id: crypto.randomUUID(),
            name,
            email,
            phone: phone || '',
            company: company || '',
            source: source || 'Google Sheet',
            status: 'New',
            deal_score: 50,
            temperature: 'Warm',
            owner_id: ownerId
            // created_at defaults to now()
        }
    });

    console.log(`[Webhook] New Lead created from Google Sheet: ${name} (${email})`);

    res.status(201).json({ message: 'Lead created successfully', leadId: newLead.id });
});
