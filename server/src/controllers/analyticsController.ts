import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { analyticsService } from '../services/analyticsService';

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const forceRefresh = req.query.refresh === 'true';
    const stats = await analyticsService.getDashboardStats(forceRefresh);
    res.json(stats);
});
