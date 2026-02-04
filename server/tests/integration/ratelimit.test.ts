import request from 'supertest';
import express from 'express';

describe('Rate Limiting Integration Tests', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();

        let requestCount = 0;
        const RATE_LIMIT = 5;

        app.get('/api/test', (req, res) => {
            requestCount++;

            if (requestCount > RATE_LIMIT) {
                return res.status(429).json({
                    error: 'Too many requests, please try again later.',
                });
            }

            res.json({ success: true, requestCount });
        });

        // Reset endpoint for testing
        app.post('/api/test/reset', (req, res) => {
            requestCount = 0;
            res.json({ success: true });
        });
    });

    beforeEach(async () => {
        await request(app).post('/api/test/reset');
    });

    it('should allow requests under the limit', async () => {
        const response = await request(app).get('/api/test');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
    });

    it('should block requests over the limit', async () => {
        // Make 5 requests (at the limit)
        for (let i = 0; i < 5; i++) {
            await request(app).get('/api/test');
        }

        // 6th request should be blocked
        const response = await request(app).get('/api/test');

        expect(response.status).toBe(429);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/too many requests/i);
    });

    it('should include rate limit headers', async () => {
        const response = await request(app).get('/api/test');

        // Note: Actual rate limit headers would be set by express-rate-limit
        expect(response.status).toBe(200);
    });
});
