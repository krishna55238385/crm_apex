import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { dealService } from '../services/dealService';

export const getDeals = asyncHandler(async (req: Request, res: Response) => {
    const deals = await dealService.findAll();
    res.json(deals);
});

export const createDeal = asyncHandler(async (req: Request, res: Response) => {
    const result = await dealService.create(req.body);
    res.status(201).json(result);
});

export const updateDeal = asyncHandler(async (req: Request, res: Response) => {
    const result = await dealService.update(req.params.id as string, req.body);
    res.json(result);
});

export const deleteDeal = asyncHandler(async (req: Request, res: Response) => {
    const result = await dealService.delete(req.params.id as string);
    res.json(result);
});
