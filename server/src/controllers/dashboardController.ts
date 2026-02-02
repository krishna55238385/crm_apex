import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const CACHE_KEY = 'dashboard:stats:global';

    // Check Cache
    if (redis.isOpen) {
        try {
            const cachedData = await redis.get(CACHE_KEY);
            if (cachedData) {
                console.log('Dashboard: Returning Cached Data');
                return res.json(JSON.parse(cachedData));
            }
        } catch (error) {
            console.warn('Redis Cache Error (Get):', error);
        }
    }

    // 1. Pipeline Value
    console.log('Dashboard: Computing Pipeline Value...');
    const pipelineAgg = await prisma.deals.aggregate({
        _sum: { value: true },
        where: {
            stage: { notIn: ['Closed___Won', 'Closed___Lost'] }
        }
    });
    const totalPipelineValue = Number(pipelineAgg._sum.value) || 0;
    console.log('Dashboard: Pipeline Value Computed');

    // 2. Deals Won
    console.log('Dashboard: Computing Deals Won...');
    const dealsWonCount = await prisma.deals.count({
        where: { stage: 'Closed___Won' }
    });

    // 3. New Leads
    console.log('Dashboard: Computing New Leads...');
    const newLeadsCount = await prisma.leads.count({
        where: { status: 'New' }
    });
    console.log('Dashboard: New Leads Computed');

    // 4. Close Ratio
    console.log('Dashboard: Computing Close Ratio...');
    const wonCount = await prisma.deals.count({ where: { stage: 'Closed___Won' } });
    const lostCount = await prisma.deals.count({ where: { stage: 'Closed___Lost' } });
    const totalClosed = wonCount + lostCount;
    const closeRatio = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0;
    console.log('Dashboard: Close Ratio Computed');

    // 5. Recent Tasks
    console.log('Dashboard: Fetching Recent Tasks...');
    const recentTasks = await prisma.tasks.findMany({
        select: {
            id: true,
            title: true,
            due_date: true,
            status: true,
            priority: true
        },
        orderBy: { due_date: 'asc' },
        take: 5
    });
    console.log('Dashboard: Recent Tasks Fetched');

    // 6. Deal Pipeline Overview
    console.log('Dashboard: Computing Pipeline Overview...');
    const stageGroups = await prisma.deals.groupBy({
        by: ['stage'],
        _count: { _all: true },
        _sum: { value: true }
    });
    console.log('Dashboard: Pipeline Overview Computed');

    const pipelineByStage = stageGroups.map((group: any) => ({
        stage: group.stage,
        count: group._count._all,
        value: Number(group._sum.value) || 0
    }));

    const responseData = {
        pipelineValue: totalPipelineValue,
        newLeads: newLeadsCount,
        dealsWon: dealsWonCount,
        closeRatio: parseFloat(closeRatio.toFixed(1)),
        recentTasks: recentTasks.map((t: any) => ({ ...t, dueDate: t.due_date })), // Map backend snake_case if needed or just return date
        pipelineByStage
    };

    // Set Cache (TTL: 5 Minutes)
    if (redis.isOpen) {
        try {
            await redis.setEx(CACHE_KEY, 300, JSON.stringify(responseData));
            console.log('Dashboard: Data Cached');
        } catch (error) {
            console.warn('Redis Cache Error (Set):', error);
        }
    }

    res.json(responseData);
});
