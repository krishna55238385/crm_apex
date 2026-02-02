import prisma from '../config/prisma';
import crypto from 'crypto';
import { trigger } from './workflowEngine';
import { AppError } from '../middlewares/errorHandler';

export class LeadService {
    async findAll(params: any) {
        const page = parseInt(params.page as string) || 1;
        const limit = parseInt(params.limit as string) || 50;
        const skip = (page - 1) * limit;

        const { status, ownerId, source, followUpStatus, search, temperature } = params;

        const where: any = {};

        if (status && status !== 'all') where.status = status;
        if (ownerId && ownerId !== 'all') where.owner_id = ownerId;
        if (source && source !== 'all') where.source = source;
        if (temperature && temperature !== 'all') where.temperature = temperature;
        if (followUpStatus && followUpStatus !== 'all') where.follow_up_status = followUpStatus;

        if (search) {
            where.OR = [
                { name: { contains: search as string } },
                { company: { contains: search as string } },
                { email: { contains: search as string } }
            ];
        }

        const [leads, total] = await Promise.all([
            prisma.leads.findMany({
                where,
                include: {
                    users: true
                },
                skip,
                take: limit,
                orderBy: { updated_at: 'desc' }
            }),
            prisma.leads.count({ where })
        ]);

        const mappedLeads = leads.map((row: any) => ({
            id: row.id,
            name: row.name,
            company: row.company,
            email: row.email,
            phone: row.phone,
            status: row.status,
            owner: row.owner_id && row.users ? {
                id: row.users.id,
                name: row.users.name,
                email: row.users.email,
                avatarUrl: row.users.avatar_url
            } : null,
            dealScore: row.deal_score,
            enrichedData: row.enriched_data,
            temperature: row.temperature,
            lastInteraction: {
                type: row.last_interaction_type,
                date: row.last_interaction_date,
                summary: row.last_interaction_summary
            },
            aiScoreReason: row.ai_score_reason,
            followUpStatus: row.follow_up_status,
            hygieneStatus: row.hygiene_status,
            source: row.source
        }));

        return {
            data: mappedLeads,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findById(id: string) {
        const lead = await prisma.leads.findUnique({
            where: { id },
            include: {
                users: true
            }
        });

        if (!lead) {
            throw new AppError('Lead not found', 404);
        }

        // Map to camelCase (matching the structure from findAll)
        return {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            status: lead.status,
            source: lead.source,
            temperature: lead.temperature,
            dealScore: lead.deal_score,
            enrichedData: lead.enriched_data,
            aiScoreReason: lead.ai_score_reason,
            followUpStatus: lead.follow_up_status,
            hygieneStatus: lead.hygiene_status,
            lastInteraction: {
                type: lead.last_interaction_type,
                date: lead.last_interaction_date,
                summary: lead.last_interaction_summary
            },
            ownerId: lead.owner_id,
            createdAt: lead.created_at,
            updatedAt: lead.updated_at,
            owner: lead.owner_id && lead.users ? {
                id: lead.users.id,
                name: lead.users.name,
                email: lead.users.email,
                avatarUrl: lead.users.avatar_url,
                role: lead.users.role
            } : null
        };
    }

    async create(data: any) {
        const { name, company, email, phone, status } = data;
        const id = crypto.randomUUID();

        // Check for duplicates (basic check)
        // const existing = await prisma.leads.findFirst({ where: { email } });
        // if (existing) throw new AppError('Lead with this email already exists', 409);

        // Transaction: Create Lead + Initial Audit Log (Atomic)
        const newLead = await prisma.$transaction(async (tx: any) => {
            // 1. Create Lead
            const lead = await tx.leads.create({
                data: {
                    id,
                    name,
                    company,
                    email,
                    phone: phone || null,
                    status: (status || 'New') as any,
                    deal_score: 50,
                    temperature: 'Cold',
                    source: 'Manual'
                }
            });

            // 2. Create Initial Audit Log
            await tx.activity_logs.create({
                data: {
                    id: crypto.randomUUID(),
                    timestamp: new Date(),
                    action: 'CREATE',
                    summary: `Lead created manually: ${name}`,
                    source: 'Manual',
                    target_type: 'Lead',
                    target_id: id,
                    target_name: name,
                    actor_name: 'System'
                }
            });

            return lead;
        });

        // Side Effect: Trigger Workflow (Outside transaction to not block DB)
        trigger('Lead Created', newLead as any).catch((err: any) => console.error("Workflow trigger failed", err));

        return newLead;
    }

    async bulkCreate(leads: any[]) {
        if (!Array.isArray(leads) || leads.length === 0) {
            throw new AppError('No leads provided', 400);
        }

        const dataToInsert = leads.map((lead: any) => ({
            id: crypto.randomUUID(),
            name: lead.name,
            company: lead.company,
            email: lead.email,
            phone: lead.phone || null,
            status: 'New' as any,
            deal_score: 50,
            temperature: 'Cold' as any,
            source: 'Import'
        }));

        const result = await prisma.leads.createMany({
            data: dataToInsert
        });

        return { message: `Successfully imported ${result.count} leads`, count: result.count };
    }

    async update(id: string, updates: any) {
        const allowedFields = ['name', 'company', 'email', 'phone', 'status', 'owner_id', 'deal_score', 'temperature', 'ai_score_reason', 'hygiene_status', 'follow_up_status', 'transfer_status', 'transfer_note', 'transfer_date'];

        const filteredUpdates: any = {};
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            throw new AppError('No valid fields to update', 400);
        }

        // Handle assignment logging logic
        if (filteredUpdates.owner_id) {
            const currentLead = await prisma.leads.findUnique({
                where: { id },
                select: { name: true }
            });

            if (currentLead) {
                const logId = crypto.randomUUID();
                const newOwner = await prisma.users.findUnique({
                    where: { id: filteredUpdates.owner_id },
                    select: { name: true }
                });

                await prisma.activity_logs.create({
                    data: {
                        id: logId,
                        timestamp: new Date(),
                        action: 'ASSIGN',
                        summary: `Forwarded to user ${newOwner?.name || 'Unknown'}`,
                        source: 'Manual',
                        target_type: 'Lead',
                        target_id: id,
                        target_name: currentLead.name,
                        actor_name: 'User', // Placeholder, ideally passed from controller via user context
                        actor_id: filteredUpdates.owner_id
                    }
                }).catch((err: any) => console.error("Logging failed", err));
            }
        }

        const updatedLead = await prisma.leads.update({
            where: { id },
            data: filteredUpdates
        });

        if (filteredUpdates.owner_id) {
            trigger('Lead Assigned', updatedLead as any).catch((err: any) => console.error("Trigger Assigned failed", err));
        }

        return updatedLead;
    }

    async delete(id: string) {
        await prisma.leads.delete({
            where: { id }
        });
        return { message: 'Lead deleted successfully' };
    }

    async addNote(id: string, note: string, userName?: string) {
        if (!note) {
            throw new AppError('Note content is required', 400);
        }

        const logId = crypto.randomUUID();

        await prisma.activity_logs.create({
            data: {
                id: logId,
                timestamp: new Date(),
                action: 'NOTE',
                summary: note,
                source: 'Manual',
                target_type: 'Lead',
                target_id: id,
                actor_name: userName || 'User'
            }
        });

        return { message: 'Note added successfully', id: logId };
    }
}

export const leadService = new LeadService();
