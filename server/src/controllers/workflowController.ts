import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middlewares/errorHandler';
import crypto from 'crypto';



// --- Workflows ---

export const getWorkflows = asyncHandler(async (req: Request, res: Response) => {
    const workflows = await prisma.workflows.findMany({
        orderBy: { created_at: 'desc' }
    });
    res.json(workflows);
});

export const createWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, trigger_type, actions, source, risk_level } = req.body;

    const newWorkflow = await prisma.workflows.create({
        data: {
            id: crypto.randomUUID(),
            name,
            description,
            trigger_type,
            actions: actions ? actions : undefined, // Prisma handles JSON
            source: source || 'Manual',
            risk_level: risk_level || 'Low',
            is_active: true
        }
    });

    res.json({ message: 'Workflow created', id: newWorkflow.id });
});

export const updateWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, trigger_type, actions, is_active } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (trigger_type !== undefined) data.trigger_type = trigger_type;
    if (actions !== undefined) data.actions = actions;
    if (is_active !== undefined) data.is_active = is_active;

    if (Object.keys(data).length === 0) {
        throw new AppError('No changes provided', 400);
    }

    await prisma.workflows.update({
        where: { id: String(id) },
        data
    });

    res.json({ message: 'Workflow updated' });
});

export const deleteWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.workflows.delete({
        where: { id: String(id) }
    });
    res.json({ message: 'Workflow deleted' });
});

// --- Execution Logs ---

export const getWorkflowLogs = asyncHandler(async (req: Request, res: Response) => {
    const { search, status, workflowId, dateFrom, dateTo } = req.query;

    const where: any = {};

    if (search) {
        where.OR = [
            { workflow_name: { contains: String(search) } },
            { action_executed: { contains: String(search) } }
        ];
    }
    if (status && status !== 'all') {
        where.status = String(status);
    }
    if (workflowId && workflowId !== 'all') {
        // Supporting Name filtering as per legacy but ideally should be ID
        where.workflow_name = String(workflowId);
    }
    if (dateFrom) {
        where.timestamp = { ...where.timestamp, gte: new Date(String(dateFrom)) };
    }
    if (dateTo) {
        where.timestamp = { ...where.timestamp, lte: new Date(String(dateTo)) };
    }

    const logs = await prisma.workflow_logs.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 100
    });

    res.json(logs);
});
