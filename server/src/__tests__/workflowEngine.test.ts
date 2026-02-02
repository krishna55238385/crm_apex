import { trigger, executeWorkflow } from '../services/workflowEngine';
import { prismaMock } from '../test/singleton'; // Use standard mock

// Mock Console to keep test output clean
global.console.log = jest.fn();
global.console.error = jest.fn();
// global.console.warn = jest.fn();

describe('Workflow Engine', () => {
    const mockEntity = {
        id: 'entity-123',
        name: 'Test Entity',
        email: 'test@example.com',
        owner_id: 'owner-456'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure void methods return a Promise to satisfy .catch()
        prismaMock.notifications.create.mockResolvedValue({} as any);
        prismaMock.notifications.createMany.mockResolvedValue({} as any);
        prismaMock.tasks.create.mockResolvedValue({} as any);
        prismaMock.workflow_logs.create.mockResolvedValue({} as any);
    });

    describe('trigger', () => {
        it('should fetch active workflows and execute them', async () => {
            const mockWorkflow = {
                id: 'wf-1',
                name: 'Test Workflow',
                actions: [{ type: 'CREATE_TASK', title: 'Test Task' }]
            };

            prismaMock.workflows.findMany.mockResolvedValue([mockWorkflow] as any);

            await trigger('LEAD_CREATED', mockEntity);

            expect(prismaMock.workflows.findMany).toHaveBeenCalledWith({
                where: { trigger_type: 'LEAD_CREATED', is_active: true }
            });
            // Check if log was created, implying execution happened
            expect(prismaMock.workflow_logs.create).toHaveBeenCalled();
        });

        it('should handle errors gracefully during trigger', async () => {
            prismaMock.workflows.findMany.mockRejectedValue(new Error('DB Error'));

            await trigger('LEAD_CREATED', mockEntity);

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('executeWorkflow', () => {
        it('should execute CREATE_TASK action', async () => {
            const mockWorkflow = {
                id: 'wf-task',
                name: 'Task Workflow',
                actions: [{ type: 'CREATE_TASK', title: 'Follow up', description: 'Call lead' }]
            };

            await executeWorkflow(mockWorkflow, mockEntity);

            expect(prismaMock.tasks.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'Follow up',
                    status: 'Upcoming',
                    related_lead_id: mockEntity.id
                })
            }));

            expect(prismaMock.workflow_logs.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'Success',
                    action_executed: 'CREATE_TASK'
                })
            }));
        });

        it('should execute SEND_NOTIFICATION (single user)', async () => {
            const mockWorkflow = {
                id: 'wf-notify',
                name: 'Notify Workflow',
                actions: [{ type: 'SEND_NOTIFICATION', userId: 'user-789', message: 'Alert' }]
            };

            await executeWorkflow(mockWorkflow, mockEntity);

            expect(prismaMock.notifications.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    user_id: 'user-789',
                    message: 'Alert'
                })
            }));
        });

        it('should execute SEND_NOTIFICATION (broadcast / all users)', async () => {
            const mockWorkflow = {
                id: 'wf-broadcast',
                name: 'Broadcast Workflow',
                actions: [{ type: 'SEND_NOTIFICATION', userId: 'all', message: 'Global Alert' }]
            };

            prismaMock.users.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }] as any);

            await executeWorkflow(mockWorkflow, mockEntity);

            expect(prismaMock.users.findMany).toHaveBeenCalled();
            expect(prismaMock.notifications.createMany).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({ user_id: 'u1' }),
                    expect.objectContaining({ user_id: 'u2' })
                ])
            }));
        });

        it('should handle JSON string actions parsing', async () => {
            const mockWorkflow = {
                id: 'wf-json',
                name: 'JSON Workflow',
                actions: JSON.stringify([{ type: 'CREATE_TASK', title: 'Parsed Task', description: 'Parsed Task' }])
            };

            await executeWorkflow(mockWorkflow, mockEntity);

            expect(prismaMock.tasks.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ title: 'Parsed Task' })
            }));
        });

        it('should log failure if execution throws', async () => {
            const mockWorkflow = {
                id: 'wf-fail',
                name: 'Fail Workflow',
                actions: [{ type: 'CREATE_TASK', title: 'Task' }]
            };

            prismaMock.tasks.create.mockRejectedValue(new Error('Task Creation Failed'));

            await executeWorkflow(mockWorkflow, mockEntity);

            expect(prismaMock.workflow_logs.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'Failed'
                })
            }));
        });
    });
});
