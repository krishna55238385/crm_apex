import admin from 'firebase-admin';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        logger.info('Firebase Admin initialized successfully');
    }
} catch (error) {
    logger.error('Firebase Admin initialization failed', error);
}

export default admin;
