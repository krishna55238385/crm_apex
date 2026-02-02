import express from 'express';
import { getDeals, createDeal, updateDeal, deleteDeal } from '../controllers/dealsController';

import { validate } from '../middlewares/validate';
import { createDealSchema, updateDealSchema } from '../schemas/dealSchema';

const router = express.Router();

router.get('/', getDeals);
router.post('/', validate(createDealSchema), createDeal);
router.put('/:id', validate(updateDealSchema), updateDeal);
router.delete('/:id', deleteDeal);

export default router;
