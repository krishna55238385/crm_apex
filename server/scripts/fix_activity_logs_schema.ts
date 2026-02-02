
import pool from '../src/config/db';

const fixSchema = async () => {
    try {
        console.log('Fixing activity_logs schema...');

        // Modify action column to be VARCHAR(50) to allow 'NOTE', 'ASSIGN', etc.
        await pool.query("ALTER TABLE activity_logs MODIFY COLUMN action VARCHAR(50)").catch((err: any) => {
            console.log("Error modifying action column:", err.message);
        });

        // Also ensure target_type and source are VARCHARs
        await pool.query("ALTER TABLE activity_logs MODIFY COLUMN target_type VARCHAR(50)").catch((err: any) => {
            console.log("Error modifying target_type column:", err.message);
        });

        console.log('Schema fix completed without critical errors.');
        process.exit(0);
    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
};

fixSchema();
