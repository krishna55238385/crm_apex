import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Get pipeline view with all deals grouped by stage
 */
export const getPipeline = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        // Get all deals with related data
        const deals = await prisma.deals.findMany({
            where: userId ? { owner_id: userId } : {},
            include: {
                leads: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: true,
                        temperature: true,
                    },
                },
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        // Group by stage
        const pipeline = {
            Prospecting: deals.filter(d => d.stage === 'Prospecting'),
            Qualification: deals.filter(d => d.stage === 'Qualification'),
            Proposal: deals.filter(d => d.stage === 'Proposal'),
            Negotiation: deals.filter(d => d.stage === 'Negotiation'),
            'Closed - Won': deals.filter(d => d.stage === 'Closed___Won'),
            'Closed - Lost': deals.filter(d => d.stage === 'Closed___Lost'),
        };

        // Calculate totals
        const stats = {
            totalDeals: deals.length,
            totalValue: deals.reduce((sum, d) => sum + Number(d.value || 0), 0),
            wonDeals: pipeline['Closed - Won'].length,
            wonValue: pipeline['Closed - Won'].reduce((sum, d) => sum + Number(d.value || 0), 0),
            lostDeals: pipeline['Closed - Lost'].length,
            activeDeals: deals.length - pipeline['Closed - Won'].length - pipeline['Closed - Lost'].length,
        };

        res.json({ pipeline, stats });
    } catch (error) {
        console.error('Get pipeline error:', error);
        res.status(500).json({ error: 'Failed to fetch pipeline' });
    }
};

/**
 * Create a new deal
 */
export const createDeal = async (req: Request, res: Response) => {
    try {
        const { name, lead_id, stage, value, probability, close_date } = req.body;
        const userId = (req as any).user?.id;

        // Validate required fields
        if (!name || !lead_id) {
            return res.status(400).json({ error: 'Name and lead_id are required' });
        }

        const deal = await prisma.deals.create({
            data: {
                id: uuidv4(),
                name,
                lead_id,
                stage: stage || 'Prospecting',
                value: value || 0,
                probability: probability || 10,
                close_date: close_date ? new Date(close_date) : null,
                owner_id: userId,
            },
            include: {
                leads: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json(deal);
    } catch (error) {
        console.error('Create deal error:', error);
        res.status(500).json({ error: 'Failed to create deal' });
    }
};

/**
 * Update deal stage (for drag-and-drop)
 */
export const updateDealStage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { stage, probability } = req.body;

        if (!stage) {
            return res.status(400).json({ error: 'Stage is required' });
        }

        // Update probability based on stage
        const stageProbabilities: Record<string, number> = {
            'Prospecting': 10,
            'Qualification': 25,
            'Proposal': 50,
            'Negotiation': 75,
            'Closed___Won': 100,
            'Closed___Lost': 0,
        };

        const deal = await prisma.deals.update({
            where: { id },
            data: {
                stage,
                probability: probability || stageProbabilities[stage] || 10,
                close_date: stage === 'Closed___Won' || stage === 'Closed___Lost'
                    ? new Date()
                    : undefined,
            },
            include: {
                leads: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(deal);
    } catch (error) {
        console.error('Update deal stage error:', error);
        res.status(500).json({ error: 'Failed to update deal stage' });
    }
};

/**
 * Update deal details
 */
export const updateDeal = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, value, probability, close_date } = req.body;

        const deal = await prisma.deals.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(value !== undefined && { value }),
                ...(probability !== undefined && { probability }),
                ...(close_date && { close_date: new Date(close_date) }),
            },
            include: {
                leads: true,
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.json(deal);
    } catch (error) {
        console.error('Update deal error:', error);
        res.status(500).json({ error: 'Failed to update deal' });
    }
};

/**
 * Delete a deal
 */
export const deleteDeal = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        await prisma.deals.delete({
            where: { id },
        });

        res.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        console.error('Delete deal error:', error);
        res.status(500).json({ error: 'Failed to delete deal' });
    }
};

/**
 * Get pipeline analytics
 */
export const getPipelineAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        const deals = await prisma.deals.findMany({
            where: userId ? { owner_id: userId } : {},
        });

        // Win rate
        const closedDeals = deals.filter(d =>
            d.stage === 'Closed___Won' || d.stage === 'Closed___Lost'
        );
        const wonDeals = deals.filter(d => d.stage === 'Closed___Won');
        const winRate = closedDeals.length > 0
            ? (wonDeals.length / closedDeals.length) * 100
            : 0;

        // Average deal value
        const avgDealValue = deals.length > 0
            ? deals.reduce((sum, d) => sum + Number(d.value || 0), 0) / deals.length
            : 0;

        // Stage distribution
        const stageDistribution = {
            Prospecting: deals.filter(d => d.stage === 'Prospecting').length,
            Qualification: deals.filter(d => d.stage === 'Qualification').length,
            Proposal: deals.filter(d => d.stage === 'Proposal').length,
            Negotiation: deals.filter(d => d.stage === 'Negotiation').length,
            'Closed - Won': wonDeals.length,
            'Closed - Lost': deals.filter(d => d.stage === 'Closed___Lost').length,
        };

        // Revenue forecast (weighted by probability)
        const forecast = deals
            .filter(d => d.stage !== 'Closed___Won' && d.stage !== 'Closed___Lost')
            .reduce((sum, d) => sum + (Number(d.value || 0) * Number(d.probability || 0) / 100), 0);

        res.json({
            winRate: Math.round(winRate * 10) / 10,
            avgDealValue: Math.round(avgDealValue * 100) / 100,
            stageDistribution,
            forecast: Math.round(forecast * 100) / 100,
            totalDeals: deals.length,
            activeDeals: deals.length - closedDeals.length,
        });
    } catch (error) {
        console.error('Get pipeline analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
