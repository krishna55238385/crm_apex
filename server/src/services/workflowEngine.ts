import prisma from '../config/prisma';
import crypto from 'crypto';
import logger from '../utils/logger';

// Simulated AI Parser
const parseAction = (actionSummary: string, entity: any) => {
    const lower = actionSummary.toLowerCase();

    if (lower.includes('email') || lower.includes('mail')) {
        return {
            type: 'SEND_EMAIL',
            recipient: entity.email,
            subject: 'Welcome!',
            body: 'Hello, thanks for joining us.'
        };
    }

    if (lower.includes('notification') || lower.includes('notify')) {
        return {
            type: 'SEND_NOTIFICATION',
            userId: entity.owner_id || 'system',
            message: actionSummary
        };
    }

    if (lower.includes('task')) {
        return {
            type: 'CREATE_TASK',
            title: 'Follow up with ' + entity.name,
            dueDate: new Date(Date.now() + 86400000) // +1 day
        };
    }

    return { type: 'UNKNOWN', summary: actionSummary };
};

import { workflowQueue } from '../config/queue';

export const trigger = async (triggerType: string, entity: any) => {
    logger.info(`[WorkflowEngine] Triggered (Async): ${triggerType} for entity ${entity.id}`);

    try {
        await workflowQueue.add('processWorkflowEvent', {
            triggerType,
            entity
        }, {
            removeOnComplete: true,
            removeOnFail: 100
        });
        logger.info(`[WorkflowEngine] Event queued successfully.`);
    } catch (error) {
        logger.error('[WorkflowEngine] Error queuing workflow event:', error);
    }
};

export const executeWorkflow = async (workflow: any, entity: any) => {
    const start = Date.now();
    let status = 'Success';
    let actionExecuted = '';
    const logId = crypto.randomUUID();

    try {
        let actions = workflow.actions;
        if (typeof actions === 'string') {
            try {
                actions = JSON.parse(actions);
            } catch (e) {
                actions = [{ summary: actions }];
            }
        }

        // Execute each action
        // Note: For Enterprise scale, this should push to a queue (BullMQ).
        for (const action of (actions as any[])) {
            const description = action.summary || action.description || 'Unknown Action';

            // Priority: Explicit Type > Keyword Parsing
            let command: any;
            if (action.type && ['SEND_EMAIL', 'SEND_NOTIFICATION', 'CREATE_TASK'].includes(action.type)) {
                if (action.type === 'SEND_EMAIL') command = { type: 'SEND_EMAIL', recipient: entity.email, subject: 'Notification', body: description };
                else if (action.type === 'SEND_NOTIFICATION') command = { type: 'SEND_NOTIFICATION', userId: action.userId || entity.owner_id || 'system', message: description };
                else if (action.type === 'CREATE_TASK') command = { type: 'CREATE_TASK', title: description, dueDate: new Date() };
            } else {
                command = parseAction(description, entity);
            }

            if (!command || !command.type) {
                logger.warn(`[WorkflowEngine] Skipping empty or invalid command for action: ${description}`);
                continue;
            }

            logger.info(`[WorkflowEngine] Executing Workflow "${workflow.name}": ${JSON.stringify(command)}`);

            actionExecuted = command.type;

            // Simulate Execution Latency
            // await new Promise(r => setTimeout(r, 500)); // Non-blocking in Prisma? No, still blocking. 
            // In a real app we'd remove this.

            if (command.type === 'SEND_EMAIL') {
                console.log(`[WorkflowEngine] Sending email to ${command.recipient}`);
                // const { sendEmail } = await import('./emailService'); 
                // await sendEmail(...)
            } else if (command.type === 'SEND_NOTIFICATION') {
                const isBroadcast = description.toLowerCase().includes('all users') ||
                    description.toLowerCase().includes('everyone') ||
                    command.userId === 'all';

                if (isBroadcast) {
                    console.log(`[WorkflowEngine] Broadcasting notification to ALL users`);
                    const users = await prisma.users.findMany({ where: { status: 'Active' }, select: { id: true } });

                    if (users.length > 0) {
                        await prisma.notifications.createMany({
                            data: users.map(u => ({
                                id: crypto.randomUUID(),
                                user_id: u.id,
                                title: 'New Notification',
                                message: command.message,
                                type: 'info'
                            }))
                        }).catch(err => console.log("Broadcast fail", err.message));
                    }
                } else {
                    console.log(`[Mock Notification] Sending alert to ${command.userId}`);
                    await prisma.notifications.create({
                        data: {
                            id: crypto.randomUUID(),
                            user_id: command.userId,
                            title: 'New Notification',
                            message: command.message,
                            type: 'info'
                        }
                    }).catch(err => console.log("Notify fail", err.message));
                }
            } else if (command.type === 'CREATE_TASK') {
                console.log(`[Mock Task] Creating task: ${command.title}`);
                await prisma.tasks.create({
                    data: {
                        id: crypto.randomUUID(),
                        title: command.title,
                        status: 'Upcoming', // Enum value
                        priority: 5, // int
                        due_date: command.dueDate,
                        related_lead_id: entity.id
                        // Note: Prisma schema says related_lead_id is VARCHAR(255), foreign key.
                    }
                });
            }
        }

    } catch (error) {
        logger.error(`[WorkflowEngine] Workflow ${workflow.id} failed:`, error);
        status = 'Failed';
    } finally {
        const duration = Date.now() - start;

        // Log execution
        await prisma.workflow_logs.create({
            data: {
                id: logId,
                workflow_id: workflow.id,
                workflow_name: workflow.name,
                status: status as any, // Enum cast if needed
                triggered_entity: { id: entity.id, name: entity.name, type: 'Lead' }, // Prisma JSON
                action_executed: actionExecuted,
                actor: 'AI',
                execution_time_ms: duration
            }
        });
    }
};
