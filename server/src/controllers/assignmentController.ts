import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import crypto from 'crypto';

export const getAssignmentRules = asyncHandler(async (req: Request, res: Response) => {
    const rules = await prisma.assignment_rules.findMany({
        orderBy: { priority: 'asc' }
    });
    res.json(rules);
});

export const addAssignmentRule = asyncHandler(async (req: Request, res: Response) => {
    const { name, conditions, assignTo, priority, isActive } = req.body;

    const newRule = await prisma.assignment_rules.create({
        data: {
            id: crypto.randomUUID(),
            name,
            conditions: conditions || {},
            assign_to: assignTo,
            priority: priority || 0,
            is_active: isActive !== undefined ? isActive : true
        }
    });

    res.json({ message: 'Rule added', id: newRule.id });
});

export const updateAssignmentRule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, conditions, assignTo, priority, isActive } = req.body;

    await prisma.assignment_rules.update({
        where: { id: String(id) },
        data: {
            name,
            conditions: conditions ?? undefined,
            assign_to: assignTo,
            priority,
            is_active: isActive
        }
    });

    res.json({ message: 'Rule updated' });
});

export const deleteAssignmentRule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.assignment_rules.delete({ where: { id: String(id) } });
    res.json({ message: 'Rule deleted' });
});
