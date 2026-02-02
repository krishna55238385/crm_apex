import { getDashboardStats } from '../dashboardController';
import { prismaMock } from '../../test/singleton';
import { Request, Response } from 'express';

describe('Dashboard Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        mockReq = {};
        jsonMock = jest.fn();
        mockRes = {
            json: jsonMock,
            status: jest.fn().mockReturnThis(),
        };
    });

    test('should return correct dashboard stats', async () => {
        // 1. Pipeline Value Mock
        prismaMock.deals.aggregate.mockResolvedValue({
            _sum: { value: 10000 },
        } as any);

        // 2. Deals Won Mock
        prismaMock.deals.count.mockResolvedValueOnce(5); // won count

        // 3. New Leads Mock
        prismaMock.leads.count.mockResolvedValue(10);

        // 4. Close Ratio Mocks (Won / Lost)
        prismaMock.deals.count.mockResolvedValueOnce(5); // won
        prismaMock.deals.count.mockResolvedValueOnce(5); // lost
        // Total closed = 10, won = 5 => 50% ratio

        // 5. Recent Tasks Mock
        const mockTasks = [
            { id: '1', title: 'Task 1', due_date: new Date('2023-01-01'), status: 'Pending', priority: 'High' }
        ];
        prismaMock.tasks.findMany.mockResolvedValue(mockTasks as any);

        // 6. Pipeline Overview Mock
        const mockGroups = [
            { stage: 'Negotiation', _count: { _all: 3 }, _sum: { value: 5000 } }
        ];
        prismaMock.deals.groupBy.mockResolvedValue(mockGroups as any);

        await getDashboardStats(mockReq as Request, mockRes as Response, jest.fn());

        expect(jsonMock).toHaveBeenCalledWith({
            pipelineValue: 10000,
            newLeads: 10,
            dealsWon: 5,
            closeRatio: 50.0,
            recentTasks: expect.arrayContaining([
                expect.objectContaining({ title: 'Task 1' })
            ]),
            pipelineByStage: expect.arrayContaining([
                expect.objectContaining({ stage: 'Negotiation', count: 3, value: 5000 })
            ])
        });
    });

    test('should handle zero pipeline value gracefully', async () => {
        prismaMock.deals.aggregate.mockResolvedValue({
            _sum: { value: null },
        } as any);

        // Mock other calls with defaults
        prismaMock.deals.count.mockResolvedValue(0);
        prismaMock.leads.count.mockResolvedValue(0);
        prismaMock.tasks.findMany.mockResolvedValue([]);
        prismaMock.deals.groupBy.mockResolvedValue([]);

        await getDashboardStats(mockReq as Request, mockRes as Response, jest.fn());

        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            pipelineValue: 0,
        }));
    });
});
