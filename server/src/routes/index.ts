import express from 'express';
import leadsRouter from './leads';
import dealsRouter from './deals';
import pipelineRouter from './pipeline';
import tasksRouter from './tasks';
import usersRouter from './users';
import analyticsRouter from './analytics';
import settingsRouter from './settings';
import workflowsRouter from './workflows';
import followUpsRouter from './followUps';
import notificationsRouter from './notifications';
import rolesRouter from './roles';
import activityLogsRouter from './activityLogs';
import dashboardRouter from './dashboardRoutes';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Public Routes (if any) go here

// Protected Routes
// router.use(authMiddleware);

router.use('/leads', leadsRouter);
router.use('/deals', dealsRouter);
router.use('/pipeline', pipelineRouter);
router.use('/tasks', tasksRouter);
router.use('/users', usersRouter);
router.use('/analytics', analyticsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/settings', settingsRouter); // Includes /settings/lead-statuses etc.
router.use('/workflows', workflowsRouter);
router.use('/follow-ups', followUpsRouter); // Note hyphen vs camelCase file
router.use('/notifications', notificationsRouter);
router.use('/roles', rolesRouter);
router.use('/activity-logs', activityLogsRouter);

// Temporary AI route mapping until frontend is updated (apiRoutes had /ai/generate-workflow)
// In workflows.ts we reused it as /workflows/ai/generate. 
// We should check if frontend calls /api/ai/generate-workflow directly.
import { generateWorkflow } from '../controllers/aiController';
router.post('/ai/generate-workflow', generateWorkflow);

export default router;
