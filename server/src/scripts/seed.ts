import prisma from '../config/prisma';
import crypto from 'crypto';

const seed = async () => {
    try {
        console.log('Verifying Schema & Seeding Data...');

        // --- Roles Seeding ---
        const rolesCount = await prisma.roles.count();
        if (rolesCount === 0) {
            console.log('Seeding default roles...');
            const defaultPerms = {
                'leads.view': true, 'leads.edit': true, 'leads.export': true,
                'deals.view': true, 'deals.edit': true,
                'automation.view': true, 'automation.edit': true,
                'ai.approve': true,
                'settings.workspace': true, 'settings.users': true, 'settings.security': true
            };

            await prisma.roles.createMany({
                data: [
                    { id: 'role-super-admin', name: 'super_admin', description: 'Organization owners.', permissions: defaultPerms, is_system: true },
                    { id: 'role-admin', name: 'admin', description: 'Team managers.', permissions: { ...defaultPerms, 'settings.security': false }, is_system: true },
                    { id: 'role-user', name: 'user', description: 'Sales reps.', permissions: { ...defaultPerms, 'leads.export': false, 'settings.security': false }, is_system: true }
                ]
            });
        }

        // --- Lead Statuses Seeding ---
        const statusCount = await prisma.lead_statuses.count();
        if (statusCount === 0) {
            console.log('Seeding lead statuses...');
            const defaultStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Lost', 'Archived'];
            await prisma.lead_statuses.createMany({
                data: defaultStatuses.map((label, i) => ({
                    id: crypto.randomUUID(),
                    label,
                    order_index: i,
                    is_default: i === 0
                }))
            });
        }

        // --- Pipeline Stages Seeding ---
        const stageCount = await prisma.pipeline_stages.count();
        if (stageCount === 0) {
            console.log('Seeding pipeline stages...');
            const defaultStages = ['Prospecting', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed - Won', 'Closed - Lost'];
            await prisma.pipeline_stages.createMany({
                data: defaultStages.map((label, i) => ({
                    id: crypto.randomUUID(),
                    label,
                    order_index: i
                }))
            });
        }

        console.log('Seeding Completed');

    } catch (error) {
        console.error('Seeding Error:', error);
    } finally {
        await prisma.$disconnect();
    }
};

seed();
