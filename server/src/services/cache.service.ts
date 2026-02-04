import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class CacheService {
    /**
     * Get cached data
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const cached = await redis.get(key);
            if (!cached) return null;
            return JSON.parse(cached) as T;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Set cache with TTL (in seconds)
     */
    async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Delete cache key
     */
    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    /**
     * Delete multiple keys by pattern
     */
    async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error('Cache delete pattern error:', error);
        }
    }

    /**
     * Cache wrapper for functions
     */
    async wrap<T>(
        key: string,
        fn: () => Promise<T>,
        ttl: number = 300
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function and cache result
        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }

    /**
     * Invalidate cache by tags
     */
    async invalidateByTags(tags: string[]): Promise<void> {
        for (const tag of tags) {
            await this.delPattern(`*:${tag}:*`);
        }
    }
}

export const cacheService = new CacheService();
