import { z } from 'zod';

export const createLeadSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).default('New')
    }).strict(),
});

export const updateLeadSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).optional(),
        owner_id: z.string().uuid().optional(),
        deal_score: z.number().min(0).max(100).optional(),
        temperature: z.enum(['Hot', 'Warm', 'Cold']).optional(),
        ai_score_reason: z.string().optional(),
        hygiene_status: z.enum(['Clean', 'Duplicate Suspected', 'Incomplete Data']).optional(),
        follow_up_status: z.enum(['Pending', 'Overdue', 'None']).optional(),
        transfer_status: z.enum(['Pending', 'Accepted', 'Rejected']).optional(),
        transfer_note: z.string().optional(),
        transfer_date: z.string().datetime().optional()
    }).strict(),
});
