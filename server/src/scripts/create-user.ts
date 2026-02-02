import prisma from '../config/prisma';
import crypto from 'crypto';

const createUser = async () => {
    try {
        const email = 'krishnasuseel2001@gmail.com';
        const name = 'Krishna Suseel'; // Derived from email or generic
        const role = 'super_admin';
        const status = 'Active';
        const id = crypto.randomUUID(); // Generating a UUID.

        // Check if user exists
        const existing = await prisma.users.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('User already exists. Updating role...');
            await prisma.users.update({
                where: { email },
                data: { role: role as any } // Cast to fit enum if simple string
            });
            console.log('User role updated to super_admin');
            return;
        }

        // Mock avatar
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        await prisma.users.create({
            data: {
                id,
                name,
                email,
                role: role as any,
                status: 'Active',
                mfa_enabled: false,
                last_active: new Date(),
                avatar_url: avatarUrl
            }
        });

        console.log(`✅ User ${email} created as SUPER ADMIN successfully.`);
        console.log(`⚠️ NOTE: If you are using Firebase Auth, you must also create this user in Firebase Console with the same email.`);

    } catch (error) {
        console.error('Failed to create user:', error);
    } finally {
        process.exit();
    }
};

createUser();
