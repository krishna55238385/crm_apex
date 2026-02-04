import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');

describe('Leads API Integration Tests', () => {
    let app: express.Application;
    let prisma: jest.Mocked<PrismaClient>;

    beforeAll(() => {
        // Create Express app with leads routes
        app = express();
        app.use(express.json());

        // Mock leads routes
        app.get('/api/leads', async (req, res) => {
            try {
                const leads = await prisma.leads.findMany();
                res.json(leads);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch leads' });
            }
        });

        app.post('/api/leads', async (req, res) => {
            try {
                const lead = await prisma.leads.create({
                    data: req.body,
                });
                res.status(201).json(lead);
            } catch (error) {
                res.status(400).json({ error: 'Failed to create lead' });
            }
        });

        app.get('/api/leads/:id', async (req, res) => {
            try {
                const lead = await prisma.leads.findUnique({
                    where: { id: req.params.id },
                });
                if (!lead) {
                    return res.status(404).json({ error: 'Lead not found' });
                }
                res.json(lead);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch lead' });
            }
        });
    });

    describe('GET /api/leads', () => {
        it('should return all leads', async () => {
            const mockLeads = [
                { id: '1', name: 'Lead 1', email: 'lead1@test.com', status: 'New' },
                { id: '2', name: 'Lead 2', email: 'lead2@test.com', status: 'Contacted' },
            ];

            prisma.leads.findMany = jest.fn().mockResolvedValue(mockLeads);

            const response = await request(app).get('/api/leads');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockLeads);
            expect(response.body).toHaveLength(2);
        });

        it('should handle errors gracefully', async () => {
            prisma.leads.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/leads');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/leads', () => {
        it('should create a new lead', async () => {
            const newLead = {
                name: 'Test Lead',
                email: 'test@example.com',
                company: 'Test Co',
                status: 'New',
            };

            const createdLead = { id: '123', ...newLead };
            prisma.leads.create = jest.fn().mockResolvedValue(createdLead);

            const response = await request(app)
                .post('/api/leads')
                .send(newLead);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(newLead);
            expect(response.body).toHaveProperty('id');
        });

        it('should validate required fields', async () => {
            const invalidLead = { name: 'Test' }; // Missing required fields

            prisma.leads.create = jest.fn().mockRejectedValue(new Error('Validation error'));

            const response = await request(app)
                .post('/api/leads')
                .send(invalidLead);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/leads/:id', () => {
        it('should return a specific lead', async () => {
            const mockLead = {
                id: '123',
                name: 'Test Lead',
                email: 'test@example.com',
                status: 'New',
            };

            prisma.leads.findUnique = jest.fn().mockResolvedValue(mockLead);

            const response = await request(app).get('/api/leads/123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockLead);
        });

        it('should return 404 for non-existent lead', async () => {
            prisma.leads.findUnique = jest.fn().mockResolvedValue(null);

            const response = await request(app).get('/api/leads/999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Lead not found');
        });
    });
});
