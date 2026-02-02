import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = express.Router();

router.get('/', requirePermission('reports.read'), getActivityLogs);

export default router;
