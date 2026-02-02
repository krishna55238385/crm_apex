import { initQueue } from '../config/queue';

export const initScheduler = async () => {
    console.log('[Scheduler] Initializing Distributed Job Queue...');
    await initQueue();
};
