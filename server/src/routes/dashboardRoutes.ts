import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStats);

export default router;
