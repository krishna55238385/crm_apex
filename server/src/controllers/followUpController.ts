import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';

export const getFollowUps = asyncHandler(async (req: Request, res: Response) => {
    const followUps = await prisma.follow_ups.findMany({
        include: {
            leads: true,
            deals: true
        },
        orderBy: { due_date: 'asc' }
    });

    const mapped = followUps.map(f => ({
        id: f.id,
        title: f.title,
        dueDate: f.due_date,
        priorityScore: f.priority_score,
        status: f.status,
        lastInteractionSummary: f.last_interaction_summary,
        actionType: f.action_type,
        lead: f.leads ? {
            id: f.leads.id,
            name: f.leads.name,
            company: f.leads.company
        } : null,
        deal: f.deals ? {
            id: f.deals.id,
            name: f.deals.name
        } : null
    }));

    res.json(mapped);
});

export const createFollowUp = asyncHandler(async (req: Request, res: Response) => {
    const { title, leadId, dealId, dueDate, priorityScore, status, actionType, summary } = req.body;

    if (!title || !leadId || !status) {
        throw new AppError('Title, Lead ID, and Status are required', 400);
    }

    const newFollowUp = await prisma.follow_ups.create({
        data: {
            id: crypto.randomUUID(),
            title,
            lead_id: leadId,
            deal_id: dealId,
            due_date: dueDate ? new Date(dueDate) : null,
            priority_score: priorityScore || 50,
            status,
            action_type: actionType || 'Call',
            last_interaction_summary: summary
        }
    });

    res.status(201).json(newFollowUp);
});

export const updateFollowUp = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, dueDate } = req.body;

    if (!status && !dueDate) {
        throw new AppError('Nothing to update', 400);
    }

    const data: any = {};
    if (status) data.status = status;
    if (dueDate) data.due_date = new Date(dueDate);

    const updated = await prisma.follow_ups.update({
        where: { id: id as string },
        data
    });

    res.json(updated);
});
