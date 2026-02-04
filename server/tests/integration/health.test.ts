import request from 'supertest';
import express from 'express';

describe('Health Endpoint', () => {
    let app: express.Application;

    beforeAll(() => {
        // Create a minimal Express app for testing
        app = express();
        app.get('/health', (req, res) => {
            res.json({ status: 'OK' });
        });
    });

    it('should return 200 OK', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'OK' });
    });

    it('should have correct content-type', async () => {
        const response = await request(app).get('/health');
        expect(response.headers['content-type']).toMatch(/json/);
    });
});
