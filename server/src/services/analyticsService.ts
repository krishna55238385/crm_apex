import prisma from '../config/prisma';
import redis from '../config/redis';

export class AnalyticsService {
    async getDashboardStats(forceRefresh = false) {
        const CACHE_KEY = 'dashboard:stats';
        const TTL = 300; // 5 minutes

        // 1. Try Cache
        if (!forceRefresh) {
            try {
                if (redis.isOpen) {
                    const getPromise = redis.get(CACHE_KEY);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 100)); // 100ms timeout

                    const cached = await Promise.race([getPromise, timeoutPromise]) as string | null;

                    if (cached) {
                        console.log('Returning cached analytics');
                        return JSON.parse(cached);
                    }
                }
                console.log('Cache miss or skip, computing analytics...');
            } catch (err) {
                console.warn('Redis cache fetch failed in AnalyticsService - proceeding to compute', err);
            }
        }

        // 2. Compute (Heavy Aggregations)
        // 1. Executive Stats (Deals)
        console.log('Computing Deal Stats...');
        const dealStats = await prisma.deals.aggregate({
            _sum: { value: true },
            _count: { _all: true },
            where: { stage: 'Closed___Won' }
        });
        console.log('Deal Stats computed');
        const totalDeals = await prisma.deals.count();
        const dealsWon = dealStats._count._all;
        const totalRevenue = Number(dealStats._sum.value) || 0;

        const conversionRate = totalDeals > 0 ? (dealsWon / totalDeals) * 100 : 0;
        const avgDealSize = dealsWon > 0 ? totalRevenue / dealsWon : 0;

        console.log('Computing Lead Stats...');
        const leadGroups = await prisma.leads.groupBy({
            by: ['status'],
            _count: { _all: true }
        });
        const totalLeads = leadGroups.reduce((acc: number, curr: any) => acc + curr._count._all, 0);
        const getLeadCount = (status: string) => leadGroups.find((g: any) => g.status === status)?._count._all || 0;
        const newLeads = getLeadCount('New');
        const qualifiedLeads = getLeadCount('Qualified');
        const contactedLeads = getLeadCount('Contacted');
        console.log('Lead Stats computed');

        // 3. Task Stats
        const taskGroups = await prisma.tasks.groupBy({
            by: ['status', 'completed'],
            _count: { _all: true }
        });
        const totalTasks = await prisma.tasks.count();
        const completedTasks = await prisma.tasks.count({ where: { completed: true } });
        const overdueTasks = await prisma.tasks.count({ where: { status: 'Overdue' } });

        const highPriorityTasks = await prisma.tasks.count({
            where: {
                priority: { gt: 70 },
                completed: false
            }
        });

        // 4. Follow-up Stats
        const followUpGroups = await prisma.follow_ups.groupBy({
            by: ['status'],
            _count: { _all: true }
        });
        const totalFollowUps = followUpGroups.reduce((acc: number, curr: any) => acc + curr._count._all, 0);
        const completedFollowUps = followUpGroups.find((g: any) => g.status === 'Completed')?._count._all || 0;
        const overdueFollowUps = followUpGroups.find((g: any) => g.status === 'Overdue')?._count._all || 0;

        // 5. Leads by Source
        const leadsBySourceGroup = await prisma.leads.groupBy({
            by: ['source'],
            _count: { _all: true }
        });
        const leadsBySource = leadsBySourceGroup.map((g: any) => ({ source: g.source, count: g._count._all }));

        // 6. Pipeline by Stage
        const pipelineGroup = await prisma.deals.groupBy({
            by: ['stage'],
            _sum: { value: true }
        });
        const pipelineByStage = pipelineGroup.map((g: any) => ({
            stage: g.stage,
            value: Number(g._sum.value) || 0
        }));

        // 7. Sales Rep Performance (Raw SQL)
        console.log('Computing Rep Stats...');
        const repStats = await prisma.$queryRaw`
            SELECT 
                u.id, u.name, u.avatar_url,
                COUNT(DISTINCT CASE WHEN d.stage = 'Closed - Won' THEN d.id END) as dealsWon,
                COALESCE(SUM(CASE WHEN d.stage = 'Closed - Won' THEN d.value ELSE 0 END), 0) as revenueGenerated,
                COALESCE(SUM(CASE WHEN d.stage NOT IN ('Closed - Won', 'Closed - Lost') THEN d.value ELSE 0 END), 0) as pipelineValue,
                CASE 
                    WHEN COUNT(DISTINCT CASE WHEN d.stage IN ('Closed - Won', 'Closed - Lost') THEN d.id END) > 0 
                    THEN (COUNT(DISTINCT CASE WHEN d.stage = 'Closed - Won' THEN d.id END) / COUNT(DISTINCT CASE WHEN d.stage IN ('Closed - Won', 'Closed - Lost') THEN d.id END)) * 100
                    ELSE 0 
                END as conversionRate,
                COUNT(DISTINCT CASE WHEN t.completed = 1 THEN t.id END) as tasksCompleted
            FROM users u
            LEFT JOIN deals d ON u.id = d.owner_id
            LEFT JOIN tasks t ON u.id = t.assigned_to_id
            WHERE u.role != 'user'
            GROUP BY u.id
        `;

        const safeRepStats = (repStats as any[]).map(r => ({
            ...r,
            dealsWon: Number(r.dealsWon),
            revenueGenerated: Number(r.revenueGenerated),
            pipelineValue: Number(r.pipelineValue),
            conversionRate: Number(r.conversionRate),
            tasksCompleted: Number(r.tasksCompleted)
        }));

        const result = {
            totalRevenue,
            conversionRate,
            avgDealSize,
            totalLeads,
            newLeads,
            qualifiedLeads,
            contactedLeads,
            leadsBySource,
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                overdue: overdueTasks,
                highPriority: highPriorityTasks
            },
            followUps: {
                total: totalFollowUps,
                completed: completedFollowUps,
                overdue: overdueFollowUps
            },
            pipelineByStage,
            salesRepPerformance: safeRepStats,
            cachedAt: new Date().toISOString()
        };

        // 3. Store in Cache
        try {
            if (redis.isOpen) {
                await redis.setEx(CACHE_KEY, TTL, JSON.stringify(result));
            }
        } catch (err) {
            console.warn('Redis cache set failed in AnalyticsService', err);
        }

        return result;
    }
}

export const analyticsService = new AnalyticsService();
