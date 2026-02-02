import { leadService } from '../leadService';
import { prismaMock } from '../../test/singleton';

// Mock the workflow engine trigger to avoid side effects
jest.mock('../../services/workflowEngine', () => ({
    trigger: jest.fn().mockResolvedValue(true)
}));

import { trigger } from '../../services/workflowEngine';

describe('LeadService', () => {
    describe('create', () => {
        it('should create a new lead and trigger workflow', async () => {
            const leadData = {
                name: 'Test Lead',
                email: 'test@example.com',
                company: 'Test Co',
                status: 'New'
            };

            const mockCreatedLead = {
                id: 'uuid-123',
                ...leadData,
                phone: null,
                deal_score: 50,
                temperature: 'Cold',
                source: 'Manual',
                created_at: new Date(),
                updated_at: new Date()
            };

            // Setup Mock
            prismaMock.leads.create.mockResolvedValue(mockCreatedLead as any);

            // Execute
            const result = await leadService.create(leadData);

            // Verify
            expect(result).toEqual(mockCreatedLead);
            expect(prismaMock.leads.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    name: 'Test Lead',
                    email: 'test@example.com'
                })
            }));
            expect(trigger).toHaveBeenCalledWith('Lead Created', expect.anything());
        });
    });

    describe('findAll', () => {
        it('should construct correct query filters', async () => {
            prismaMock.leads.findMany.mockResolvedValue([]);
            prismaMock.leads.count.mockResolvedValue(0);

            await leadService.findAll({ status: 'New', search: 'Acme' });

            expect(prismaMock.leads.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    status: 'New',
                    OR: expect.arrayContaining([
                        { name: { contains: 'Acme' } }
                    ])
                })
            }));
        });
    });
});
