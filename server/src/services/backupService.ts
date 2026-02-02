import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

class BackupService {
    private backupDir: string;

    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.ensureBackupDir();
    }

    private ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    public scheduleBackups() {
        // Run every day at midnight (00:00)
        cron.schedule('0 0 * * *', () => {
            logger.info('Backup: Starting daily database backup...');
            this.createBackup();
        });
        logger.info('Backup Service: Scheduled (Daily @ 00:00)');
    }

    public async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(this.backupDir, filename);

        // Usage: mysqldump -u [user] -p[password] [database_name] > [file]
        // Note: In production, password should be in .my.cnf or env variable handling needs care (avoid command line warning)
        const dbUser = process.env.DB_USER || 'root';
        // const dbPass = process.env.DB_PASS || 'password'; // Use env vars strictly
        const dbName = process.env.DB_NAME || 'crm';

        // Construct command (Simple version for MVP, assuming local auth or config)
        // ideally use "mysqldump --login-path=local ..."
        const command = `mysqldump -u ${dbUser} ${dbName} > "${filepath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error('Backup Failed:', error);
                return;
            }
            logger.info(`Backup Created Successfully: ${filename}`);

            // TODO: Upload to S3 here
            // this.uploadToS3(filepath);
        });
    }
}

export const backupService = new BackupService();
