
import pool from '../src/config/db';

const checkDB = async () => {
    try {
        console.log("Checking database tables...");
        const [rows] = await pool.query("SHOW TABLES");
        console.log("Tables:", JSON.stringify(rows));

        try {
            const [leads] = await pool.query("SELECT COUNT(*) as count FROM leads");
            console.log("Leads count:", JSON.stringify(leads));

            const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
            console.log("Users count:", JSON.stringify(users));
        } catch (e: any) {
            console.error("Error querying tables:", e.message);
        }

    } catch (e) {
        console.error("Connection error:", e);
    } finally {
        process.exit();
    }
};

checkDB();
