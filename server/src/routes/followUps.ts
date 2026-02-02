import express from 'express';
import { getFollowUps, createFollowUp, updateFollowUp } from '../controllers/followUpController';

const router = express.Router();

router.get('/', getFollowUps);
router.post('/', createFollowUp);
router.put('/:id', updateFollowUp);

export default router;
