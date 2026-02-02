import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { leadService } from '../services/leadService';

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
    const result = await leadService.findAll(req.query);
    res.json(result);
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.findById(req.params.id as string);
    res.json(lead);
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
    const newLead = await leadService.create(req.body);
    res.status(201).json(newLead);
});

export const bulkCreateLeads = asyncHandler(async (req: Request, res: Response) => {
    const result = await leadService.bulkCreate(req.body.leads);
    res.status(201).json(result);
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
    const result = await leadService.delete(req.params.id as string);
    res.json(result);
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
    const updatedLead = await leadService.update(req.params.id as string, req.body);
    res.json(updatedLead);
});

export const addNote = asyncHandler(async (req: Request, res: Response) => {
    const { note, userName } = req.body;
    const result = await leadService.addNote(req.params.id as string, note, userName);
    res.status(201).json(result);
});
