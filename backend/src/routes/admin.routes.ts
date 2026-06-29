import { Router } from 'express';
import { z } from 'zod';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';

const router: ReturnType<typeof Router> = Router();

router.use(authenticate, requireRole('admin'));

const roleSchema = z.object({ role: z.enum(['user', 'host', 'admin']) });

router.get('/meetings', adminController.meetings);
router.get('/users', adminController.users);
router.patch('/users/:id/role', validateBody(roleSchema), adminController.changeRole);
router.delete('/meetings/:id', adminController.forceEnd);
router.get('/stats', adminController.stats);
router.get('/meetings/:id/report', adminController.report);
router.get('/analytics', adminController.analytics);

export default router;
