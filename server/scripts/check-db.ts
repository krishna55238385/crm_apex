import prisma from '../src/config/prisma';

async function main() {
    console.log('Testing Database Connection...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        // Try a simple query
        const userCount = await prisma.users.count();
        console.log(`Connection verified. Found ${userCount} users.`);

    } catch (e) {
        console.error('Failed to connect to database:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
