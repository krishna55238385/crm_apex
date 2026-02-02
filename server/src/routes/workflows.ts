import express from 'express';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, getWorkflowLogs } from '../controllers/workflowController';
import { generateWorkflow } from '../controllers/aiController';

const router = express.Router();

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

router.get('/logs', getWorkflowLogs);

// AI Generation
router.post('/ai/generate', generateWorkflow);

export default router;
