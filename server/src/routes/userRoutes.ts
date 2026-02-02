import express from 'express';
import { requireRole, requirePermission } from '../middlewares/rbacMiddleware';
import { getUsers, updateUser, syncUser, suspendUser, deleteUser, reassignWork } from '../controllers/userController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/sync', syncUser); // Any auth user can sync themselves? Yes.
router.get('/', requirePermission('users.read'), getUsers);
router.put('/:id', requirePermission('users.write'), updateUser);
import { updateUserRole } from '../controllers/userController';
router.put('/:id/role', requireRole('super_admin'), updateUserRole);
router.put('/:id/status', requireRole(['admin', 'super_admin']), suspendUser);
router.delete('/:id', requireRole('super_admin'), deleteUser);
router.post('/:id/reassign', requireRole(['admin', 'super_admin']), reassignWork);

export default router;
