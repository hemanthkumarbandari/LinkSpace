import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router: ReturnType<typeof Router> = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const guestSchema = z.object({
  displayName: z.string().min(1).max(50),
  meetingId: z.string().min(6).max(12).optional(),
});

router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  authController.register
);
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);
router.post(
  '/refresh',
  validateBody(refreshSchema),
  authController.refresh
);
router.post(
  '/guest',
  authRateLimiter,
  validateBody(guestSchema),
  authController.guest
);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
