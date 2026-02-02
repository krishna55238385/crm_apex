
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Successfully connected to database.');

        const leadCount = await prisma.leads.count();
        console.log(`Lead count: ${leadCount}`);

        const usersCount = await prisma.users.count();
        console.log(`User count: ${usersCount}`);

        if (leadCount > 0) {
            const firstLead = await prisma.leads.findFirst();
            console.log('Sample Lead:', JSON.stringify(firstLead, null, 2));
        }

    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
