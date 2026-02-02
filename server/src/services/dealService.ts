import prisma from '../config/prisma';
import crypto from 'crypto';

export class DealService {
    async findAll() {
        const deals = await prisma.deals.findMany({
            include: {
                leads: true,
                users: true // owner
            },
            orderBy: { created_at: 'desc' }
        });

        return deals.map(d => ({
            id: d.id,
            name: d.name,
            stage: d.stage,
            value: Number(d.value),
            closeDate: d.close_date,
            probability: d.probability,
            lead: d.leads ? {
                id: d.leads.id,
                name: d.leads.name,
                company: d.leads.company
            } : null,
            owner: d.users ? {
                id: d.users.id,
                name: d.users.name,
                email: d.users.email,
                avatarUrl: d.users.avatar_url
            } : null
        }));
    }

    async create(data: any) {
        const { name, leadId, stage, value, closeDate, ownerId, probability } = data;

        const formattedCloseDate = closeDate ? new Date(closeDate) : null;

        const newDeal = await prisma.deals.create({
            data: {
                id: crypto.randomUUID(),
                name,
                lead_id: leadId,
                stage,
                value: value || 0,
                close_date: formattedCloseDate,
                owner_id: ownerId,
                probability: probability || 50
            }
        });

        return { id: newDeal.id, message: 'Deal created successfully', deal: newDeal };
    }

    async update(id: string, data: any) {
        const { name, stage, value, closeDate, probability } = data;

        const formattedCloseDate = closeDate ? new Date(closeDate) : undefined;

        const updatedDeal = await prisma.deals.update({
            where: { id },
            data: {
                name,
                stage,
                value,
                close_date: formattedCloseDate,
                probability
            }
        });

        return { message: 'Deal updated successfully', deal: updatedDeal };
    }

    async delete(id: string) {
        await prisma.deals.delete({ where: { id } });
        return { message: 'Deal deleted successfully' };
    }
}

export const dealService = new DealService();
