import { Request, Response } from 'express';
import request from 'supertest';
import express from 'express';

describe('Pipeline API', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // Import and use pipeline routes
        // Note: In real test, you'd set up the full app with auth middleware mocked
    });

    describe('GET /api/pipeline', () => {
        it('should return pipeline with deals grouped by stage', async () => {
            const response = await request(app)
                .get('/api/pipeline')
                .expect('Content-Type', /json/);

            expect(response.body).toHaveProperty('pipeline');
            expect(response.body).toHaveProperty('stats');
            expect(response.body.pipeline).toHaveProperty('Prospecting');
            expect(response.body.pipeline).toHaveProperty('Qualification');
        });
    });

    describe('POST /api/deals', () => {
        it('should create a new deal', async () => {
            const newDeal = {
                name: 'Test Deal',
                lead_id: 'test-lead-id',
                stage: 'Prospecting',
                value: 10000,
            };

            const response = await request(app)
                .post('/api/deals')
                .send(newDeal)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Test Deal');
        });
    });

    describe('PUT /api/deals/:id/stage', () => {
        it('should update deal stage', async () => {
            const response = await request(app)
                .put('/api/deals/test-id/stage')
                .send({ stage: 'Qualification' })
                .expect(200);

            expect(response.body.stage).toBe('Qualification');
            expect(response.body.probability).toBe(25);
        });
    });

    describe('GET /api/pipeline/analytics', () => {
        it('should return pipeline analytics', async () => {
            const response = await request(app)
                .get('/api/pipeline/analytics')
                .expect(200);

            expect(response.body).toHaveProperty('winRate');
            expect(response.body).toHaveProperty('avgDealValue');
            expect(response.body).toHaveProperty('forecast');
        });
    });
});
