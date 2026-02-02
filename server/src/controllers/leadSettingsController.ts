import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import crypto from 'crypto';

// --- Lead Statuses ---

export const getLeadStatuses = asyncHandler(async (req: Request, res: Response) => {
    const statuses = await prisma.lead_statuses.findMany({
        orderBy: { order_index: 'asc' }
    });
    res.json(statuses);
});

export const addLeadStatus = asyncHandler(async (req: Request, res: Response) => {
    const { label, orderIndex } = req.body;

    let newOrderIndex = orderIndex;
    if (newOrderIndex === undefined) {
        const agg = await prisma.lead_statuses.aggregate({
            _max: { order_index: true }
        });
        newOrderIndex = (agg._max.order_index || 0) + 1;
    }

    const newStatus = await prisma.lead_statuses.create({
        data: {
            id: crypto.randomUUID(),
            label,
            order_index: newOrderIndex
        }
    });

    res.json({ message: 'Status added', id: newStatus.id, label, order_index: newOrderIndex });
});

export const updateLeadStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { label, orderIndex, color } = req.body;

    await prisma.lead_statuses.update({
        where: { id: String(id) },
        data: {
            label,
            order_index: orderIndex,
            color
        }
    });

    res.json({ message: 'Status updated' });
});

export const deleteLeadStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.lead_statuses.delete({ where: { id: String(id) } });
    res.json({ message: 'Status deleted' });
});

// --- Pipeline Stages ---

export const getPipelineStages = asyncHandler(async (req: Request, res: Response) => {
    const stages = await prisma.pipeline_stages.findMany({
        orderBy: { order_index: 'asc' }
    });
    res.json(stages);
});

export const addPipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const { label, orderIndex } = req.body;

    let newOrderIndex = orderIndex;
    if (newOrderIndex === undefined) {
        const agg = await prisma.pipeline_stages.aggregate({
            _max: { order_index: true }
        });
        newOrderIndex = (agg._max.order_index || 0) + 1;
    }

    const newStage = await prisma.pipeline_stages.create({
        data: {
            id: crypto.randomUUID(),
            label,
            order_index: newOrderIndex
        }
    });

    res.json({ message: 'Stage added', id: newStage.id, label, order_index: newOrderIndex });
});

export const updatePipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { label, orderIndex, color } = req.body;

    await prisma.pipeline_stages.update({
        where: { id: String(id) },
        data: {
            label,
            order_index: orderIndex,
            color
        }
    });

    res.json({ message: 'Stage updated' });
});

export const deletePipelineStage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.pipeline_stages.delete({ where: { id: String(id) } });
    res.json({ message: 'Stage deleted' });
});
