import { Router } from 'express';
import { z } from 'zod';
import * as recordingController from '../controllers/recording.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateParams } from '../middleware/validate.middleware.js';

const router: ReturnType<typeof Router> = Router({ mergeParams: true });
const meetingIdSchema = z.object({ meetingId: z.string().min(6).max(12) });

router.post(
  '/:meetingId/upload',
  authenticate,
  validateParams(meetingIdSchema),
  recordingController.upload
);
router.post(
  '/:meetingId/start',
  authenticate,
  validateParams(meetingIdSchema),
  recordingController.start
);
router.post(
  '/:meetingId/stop',
  authenticate,
  validateParams(meetingIdSchema),
  recordingController.stop
);
router.get(
  '/:meetingId',
  authenticate,
  validateParams(meetingIdSchema),
  recordingController.list
);

export default router;
