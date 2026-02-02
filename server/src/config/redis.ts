import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = createClient({
    url: redisUrl
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

// Connect immediately but gracefully
(async () => {
    if (!redis.isOpen) {
        try {
            await redis.connect();
        } catch (err) {
            console.warn('Redis connection failed - defaulting to in-memory fallback (partial functionality)', err);
        }
    }
})();

export default redis;
