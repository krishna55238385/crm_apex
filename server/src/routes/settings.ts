import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import {
    getLeadStatuses, addLeadStatus, updateLeadStatus, deleteLeadStatus,
    getPipelineStages, addPipelineStage, updatePipelineStage, deletePipelineStage
} from '../controllers/leadSettingsController';
import {
    getAssignmentRules, addAssignmentRule, updateAssignmentRule, deleteAssignmentRule
} from '../controllers/assignmentController';

const router = express.Router();

// General Settings
router.get('/:key', getSettings);
router.put('/:key', updateSettings);

// Lead Statuses
router.get('/lead-statuses', getLeadStatuses);
router.post('/lead-statuses', addLeadStatus);
router.put('/lead-statuses/:id', updateLeadStatus);
router.delete('/lead-statuses/:id', deleteLeadStatus);

// Pipeline Stages
router.get('/pipeline-stages', getPipelineStages);
router.post('/pipeline-stages', addPipelineStage);
router.put('/pipeline-stages/:id', updatePipelineStage);
router.delete('/pipeline-stages/:id', deletePipelineStage);

// Assignment Rules
router.get('/assignment-rules', getAssignmentRules);
router.post('/assignment-rules', addAssignmentRule);
router.put('/assignment-rules/:id', updateAssignmentRule);
router.delete('/assignment-rules/:id', deleteAssignmentRule);

export default router;
