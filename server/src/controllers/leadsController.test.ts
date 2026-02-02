import { Request, Response } from 'express';
import { getLeads, createLead } from '../controllers/leadsController';
import { prismaMock } from '../test/singleton';

// Mock request and response objects
const mockRequest = (body = {}) => ({
    body,
    params: {},
} as Request);

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
};

describe('Leads Controller', () => {
    test('getLeads should return mapped leads', async () => {
        const req = mockRequest();
        const res = mockResponse();

        const mockLeads = [
            {
                id: 'lead-1',
                name: 'John Doe',
                company: 'Acme',
                email: 'john@acme.com',
                phone: '123',
                status: 'New',
                deal_score: 50,
                enriched_data: null,
                temperature: 'Cold',
                last_interaction_type: null,
                last_interaction_date: null,
                last_interaction_summary: null,
                ai_score_reason: null,
                follow_up_status: null,
                hygiene_status: null,
                source: 'Manual',
                owner_id: null,
            }
        ];

        prismaMock.leads.findMany.mockResolvedValue(mockLeads as any);

        await getLeads(req, res, () => { });

        expect(prismaMock.leads.findMany).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ name: 'John Doe', company: 'Acme' })
        ]));
    });

    test('createLead should create a lead and return 201', async () => {
        const req = mockRequest({
            name: 'Jane Doe',
            company: 'Globex',
            email: 'jane@globex.com',
        });
        const res = mockResponse();

        const createdLead = {
            id: 'generated-id',
            name: 'Jane Doe',
            company: 'Globex',
            email: 'jane@globex.com',
            phone: null,
            status: 'New',
            deal_score: 50,
            temperature: 'Cold',
            source: 'Manual',
        };

        prismaMock.leads.create.mockResolvedValue(createdLead as any);

        await createLead(req, res, () => { });

        expect(prismaMock.leads.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane@globex.com'
            })
        }));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdLead);
    });
});
