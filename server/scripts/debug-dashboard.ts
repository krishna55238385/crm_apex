import prisma from '../src/config/prisma';

async function debugDashboard() {
    console.log('Starting Dashboard Debug...');

    try {
        // 1. Pipeline Value
        console.log('1. Computing Pipeline Value...');
        const pipelineAgg = await prisma.deals.aggregate({
            _sum: { value: true },
            where: {
                stage: { notIn: ['Closed___Won', 'Closed___Lost'] }
            }
        });
        console.log('Pipeline Value:', pipelineAgg._sum.value);

        // 2. Deals Won
        console.log('2. Computing Deals Won...');
        const dealsWonCount = await prisma.deals.count({
            where: { stage: 'Closed___Won' }
        });
        console.log('Deals Won:', dealsWonCount);

        // 3. New Leads
        console.log('3. Computing New Leads...');
        const newLeadsCount = await prisma.leads.count({
            where: { status: 'New' }
        });
        console.log('New Leads:', newLeadsCount);

        // 4. Close Ratio
        console.log('4. Computing Close Ratio...');
        const wonCount = await prisma.deals.count({ where: { stage: 'Closed___Won' } });
        const lostCount = await prisma.deals.count({ where: { stage: 'Closed___Lost' } });
        const totalClosed = wonCount + lostCount;
        const closeRatio = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0;
        console.log('Close Ratio:', closeRatio);

        // 5. Recent Tasks
        console.log('5. Fetching Recent Tasks...');
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
        console.log('Recent Tasks Found:', recentTasks.length);

        // 6. Deal Pipeline Overview
        console.log('6. Computing Pipeline Overview...');
        const stageGroups = await prisma.deals.groupBy({
            by: ['stage'],
            _count: { _all: true },
            _sum: { value: true }
        });
        console.log('Pipeline Overview Groups:', stageGroups.length);

        console.log('Dashboard Debug Complete - Success');

    } catch (error) {
        console.error('Dashboard Debug Failed at step:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugDashboard();
