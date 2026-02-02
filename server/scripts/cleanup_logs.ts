
import pool from '../src/config/db';

const cleanLogs = async () => {
    try {
        console.log('Cleaning up activity logs...');

        // 1. Delete the "Test User Agent" log
        await pool.query("DELETE FROM activity_logs WHERE actor_name = 'Test User Agent'");
        console.log("Deleted 'Test User Agent' logs.");

        // 2. Update generic "User" logs to "krishnasuseel2001" (assuming these belong to the user)
        // Ideally we filter by actor_id if available, but for now we assume the manual testing was done by the logged in user context
        // or that 'User' is just a placeholder we want to replace with the primary user's name for this demo.
        // We can be safer by updating where actor_name = 'User'

        await pool.query("UPDATE activity_logs SET actor_name = 'krishnasuseel2001' WHERE actor_name = 'User'");
        console.log("Updated 'User' to 'krishnasuseel2001'.");

        process.exit(0);
    } catch (error) {
        console.error('Error cleaning logs:', error);
        process.exit(1);
    }
};

cleanLogs();
