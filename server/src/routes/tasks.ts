import express from 'express';
import { getTasks, createTask } from '../controllers/tasksController';

import { validate } from '../middlewares/validate';
import { createTaskSchema } from '../schemas/taskSchema';

const router = express.Router();

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);

export default router;
