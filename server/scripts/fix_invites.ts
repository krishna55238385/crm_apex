
import pool from '../src/config/db';

const fixInvites = async () => {
    try {
        console.log('Creating invites table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS invites (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') NOT NULL,
                status ENUM('Pending', 'Accepted', 'Expired') NOT NULL DEFAULT 'Pending',
                invited_by VARCHAR(255),
                invite_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                expiry_date DATETIME,
                token VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Invites table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create invites table:', error);
        process.exit(1);
    }
};

fixInvites();
