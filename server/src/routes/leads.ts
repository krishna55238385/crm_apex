import express from 'express';
import { getLeads, getLead, createLead, bulkCreateLeads, deleteLead, updateLead, addNote } from '../controllers/leadsController';
import { validate } from '../middlewares/validate';
import { createLeadSchema, updateLeadSchema } from '../schemas/leadSchema';

const router = express.Router();

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: Retrieve a list of leads
 *     description: Retrieve all leads with their associated owners.
 *     responses:
 *       200:
 *         description: A list of leads.
 */
router.get('/', getLeads);
router.get('/:id', getLead);

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create a new lead
 *     description: Create a new lead with rigorous validation.
 */
router.post('/', validate(createLeadSchema), createLead);
router.post('/bulk', bulkCreateLeads);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.post('/:id/notes', addNote);
router.delete('/:id', deleteLead);

export default router;
