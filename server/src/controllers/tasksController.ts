import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { taskService } from '../services/taskService';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
    const tasks = await taskService.findAll();
    res.json(tasks);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
    const newTask = await taskService.create(req.body);
    res.status(201).json(newTask);
});
