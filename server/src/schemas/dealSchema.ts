import { z } from 'zod';

export const createDealSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Deal name must be at least 2 characters'),
        value: z.number().nonnegative('Value must be positive'),
        stage: z.string().min(1, 'Stage is required'),
        leadId: z.string().uuid('Invalid Lead ID format'),
        probability: z.number().min(0).max(100).optional()
    })
});

export const updateDealSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        value: z.number().nonnegative().optional(),
        stage: z.string().min(1).optional(),
        probability: z.number().min(0).max(100).optional()
    })
});
