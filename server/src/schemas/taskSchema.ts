import { z } from 'zod';

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().min(2, 'Title is required'),
        dueDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")),
        priority: z.number().int().min(1).max(5).optional().default(3),
        assignedToId: z.string().uuid('Invalid User ID'),
        relatedLeadId: z.string().uuid('Invalid Lead ID').optional(),
        status: z.enum(['Focus Now', 'Today', 'Upcoming', 'Overdue', 'Completed']).optional()
    })
});

export const updateTaskSchema = z.object({
    body: z.object({
        title: z.string().min(2).optional(),
        dueDate: z.string().datetime().optional(),
        priority: z.number().int().min(1).max(5).optional(),
        status: z.enum(['Focus Now', 'Today', 'Upcoming', 'Overdue', 'Completed']).optional(),
        completed: z.boolean().optional()
    })
});
