import express from 'express';
import { getUsers, updateUser, suspendUser, deleteUser, reassignWork, syncUser, updateUserRole } from '../controllers/userController';
import { requirePermission, requireRole } from '../middlewares/rbacMiddleware';
import { getInvites, createInvite, deleteInvite } from '../controllers/inviteController';

const router = express.Router();

// User Actions
router.post('/sync', syncUser);
router.get('/', requirePermission('users.read'), getUsers);
router.put('/:id', requirePermission('users.write'), updateUser);
router.put('/:id/role', requireRole('super_admin'), updateUserRole);
router.put('/:id/status', requireRole(['admin', 'super_admin']), suspendUser);
router.delete('/:id', requireRole('super_admin'), deleteUser);
router.post('/:id/reassign', requireRole(['admin', 'super_admin']), reassignWork);

// Invite Sub-routes (could be separate, but fits user management)
router.get('/invites', getInvites);
router.post('/invites', createInvite);
router.delete('/invites/:id', deleteInvite);

export default router;
