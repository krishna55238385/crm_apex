import express from 'express';
import {
    getPipeline,
    createDeal,
    updateDealStage,
    updateDeal,
    deleteDeal,
    getPipelineAnalytics,
} from '../controllers/pipelineController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { cacheMiddleware } from '../middlewares/cache';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/pipeline:
 *   get:
 *     summary: Get pipeline view
 *     tags: [Pipeline]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pipeline with deals grouped by stage
 */
router.get('/', cacheMiddleware(60), getPipeline);

/**
 * @swagger
 * /api/pipeline/analytics:
 *   get:
 *     summary: Get pipeline analytics
 *     tags: [Pipeline]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pipeline analytics and metrics
 */
router.get('/analytics', cacheMiddleware(300), getPipelineAnalytics);

/**
 * @swagger
 * /api/deals:
 *   post:
 *     summary: Create a new deal
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lead_id
 *             properties:
 *               name:
 *                 type: string
 *               lead_id:
 *                 type: string
 *               stage:
 *                 type: string
 *               value:
 *                 type: number
 *               probability:
 *                 type: number
 *               close_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Deal created successfully
 */
router.post('/deals', createDeal);

/**
 * @swagger
 * /api/deals/{id}/stage:
 *   put:
 *     summary: Update deal stage
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stage
 *             properties:
 *               stage:
 *                 type: string
 *               probability:
 *                 type: number
 *     responses:
 *       200:
 *         description: Deal stage updated
 */
router.put('/deals/:id/stage', updateDealStage);

/**
 * @swagger
 * /api/deals/{id}:
 *   put:
 *     summary: Update deal details
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               value:
 *                 type: number
 *               probability:
 *                 type: number
 *               close_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Deal updated successfully
 */
router.put('/deals/:id', updateDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   delete:
 *     summary: Delete a deal
 *     tags: [Deals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deal deleted successfully
 */
router.delete('/deals/:id', deleteDeal);

export default router;
