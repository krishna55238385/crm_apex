import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from './prisma';
import logger from '../utils/logger';
import { executeWorkflow } from '../services/workflowEngine';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const workflowQueue = new Queue('workflowQueue', { connection });

// Initialize Worker
const worker = new Worker('workflowQueue', async (job) => {
    if (job.name === 'checkScheduledWorkflows') {
        const now = new Date();
        logger.info(`[Job] Checking scheduled workflows at ${now.toISOString()}`);

        try {
            // Fetch all active "Time Elapsed" workflows
            const activeWorkflows = await prisma.workflows.findMany({
                where: {
                    trigger_type: 'Time Elapsed',
                    is_active: true
                }
            });

            for (const w of activeWorkflows) {
                // Heuristic parsing
                const desc = w.description || '';
                const match = desc.match(/at\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

                if (match) {
                    let hour = parseInt(match[1]);
                    const minute = parseInt(match[2]);
                    const meridian = match[3]?.toUpperCase();

                    if (meridian === 'PM' && hour < 12) hour += 12;
                    if (meridian === 'AM' && hour === 12) hour = 0;

                    if (now.getHours() === hour && now.getMinutes() === minute) {
                        logger.info(`[Job] Firing Scheduled Workflow: ${w.name}`);
                        await executeWorkflow(w, { id: 'system', name: 'System Scheduler' });
                    }
                }
            }
        } catch (error) {
            logger.error('[Job] Error checking schedules:', error);
            throw error;
        }
    } else if (job.name === 'processWorkflowEvent') {
        const { triggerType, entity } = job.data;
        logger.info(`[Job] Processing Workflow Event: ${triggerType} for entity ${entity?.id}`);

        try {
            const workflows = await prisma.workflows.findMany({
                where: {
                    trigger_type: triggerType,
                    is_active: true
                }
            });

            logger.info(`[Job] Found ${workflows.length} matching workflows`);

            for (const workflow of workflows) {
                await executeWorkflow(workflow, entity);
            }
        } catch (error) {
            logger.error(`[Job] Error processing workflow event ${triggerType}:`, error);
            throw error;
        }
    }
}, { connection });

worker.on('completed', job => {
    logger.info(`[Job] ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    logger.error(`[Job] ${job?.id} has failed with ${err.message}`);
});

export const initQueue = async () => {
    // Add the repeatable job if not exists
    await workflowQueue.add('checkScheduledWorkflows', {}, {
        repeat: {
            pattern: '* * * * *' // Every minute
        }
    });
    logger.info('[Queue] Scheduled repeated workflow check');
};
