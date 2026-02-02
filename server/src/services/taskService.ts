import prisma from '../config/prisma';
import crypto from 'crypto';
import { AppError } from '../middlewares/errorHandler';

export class TaskService {
    async findAll() {
        const tasks = await prisma.tasks.findMany({
            include: {
                users: true
            },
            orderBy: { due_date: 'asc' }
        });

        return tasks.map(t => ({
            id: t.id,
            title: t.title,
            dueDate: t.due_date,
            completed: Boolean(t.completed),
            status: t.status,
            priority: t.priority,
            aiReason: t.ai_reason,
            intent: t.intent,
            assignedTo: t.users ? {
                id: t.users.id,
                name: t.users.name,
                avatarUrl: t.users.avatar_url
            } : null
        }));
    }

    async create(data: any) {
        const { title, date, status, priority, assignedToId, intent, relatedLeadId, relatedDealId, assignedTo } = data; // Note: validation middleware handles basic checks mostly

        // Legacy check preserved just in case
        if (!title) {
            throw new AppError('Title is required', 400);
        }

        const newTask = await prisma.tasks.create({
            data: {
                id: crypto.randomUUID(),
                title,
                due_date: date ? new Date(date) : null,
                status: status || 'Upcoming',
                priority: priority || 50,
                assigned_to_id: assignedToId || assignedTo, // Handle potential field mismatch from frontend vs schema
                intent: intent || 'Manual task',
                related_lead_id: relatedLeadId,
                related_deal_id: relatedDealId
            }
        });

        return newTask;
    }
}

export const taskService = new TaskService();
