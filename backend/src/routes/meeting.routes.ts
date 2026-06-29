import { Router } from 'express';
import { z } from 'zod';
import * as meetingController from '../controllers/meeting.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';

const router: ReturnType<typeof Router> = Router();
const meetingIdSchema = z.object({ meetingId: z.string().min(6).max(12) });

const createSchema = z.object({
  title: z.string().max(200).optional(),
  type: z.enum(['instant', 'scheduled', 'recurring']).optional(),
  scheduledAt: z.string().datetime().optional(),
  settings: z
    .object({
      waitingRoom: z.boolean().optional(),
      allowChat: z.boolean().optional(),
      allowScreenShare: z.boolean().optional(),
      muteOnEntry: z.boolean().optional(),
      allowReactions: z.boolean().optional(),
      recordingEnabled: z.boolean().optional(),
      password: z.string().optional(),
    })
    .optional(),
  batchId: z.string().optional(),
  courseId: z.string().optional(),
});

const joinSchema = z.object({ password: z.string().optional() });

router.post('/', authenticate, validateBody(createSchema), meetingController.create);
router.get('/history', authenticate, meetingController.history);
router.get(
  '/:meetingId',
  validateParams(meetingIdSchema),
  meetingController.getById
);
router.post(
  '/:meetingId/join',
  authenticate,
  validateParams(meetingIdSchema),
  validateBody(joinSchema),
  meetingController.join
);
router.post(
  '/:meetingId/rejoin',
  authenticate,
  validateParams(meetingIdSchema),
  validateBody(joinSchema),
  meetingController.rejoin
);
router.patch(
  '/:meetingId/end',
  authenticate,
  validateParams(meetingIdSchema),
  meetingController.end
);
router.get(
  '/:meetingId/chat',
  authenticate,
  validateParams(meetingIdSchema),
  meetingController.chat
);
router.get(
  '/:meetingId/participants',
  authenticate,
  validateParams(meetingIdSchema),
  meetingController.participants
);
router.get(
  '/:meetingId/attendance',
  authenticate,
  validateParams(meetingIdSchema),
  meetingController.attendance
);

export default router;
