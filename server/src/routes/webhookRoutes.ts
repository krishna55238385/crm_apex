import { Router } from 'express';
import { handleGoogleSheetLead } from '../controllers/webhookController';

const router = Router();

// POST /api/webhooks/leads - Endpoint for Google Sheets
router.post('/leads', handleGoogleSheetLead);

export default router;
