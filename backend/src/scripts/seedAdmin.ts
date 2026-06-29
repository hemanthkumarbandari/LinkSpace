import { User } from '../models/User.model.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.config.js';

export async function seedAdmin(): Promise<void> {
  const email = env.ADMIN_SEED_EMAIL.toLowerCase();
  let user = await User.findOne({ email }).select('+password');

  if (user) {
    let changed = false;
    if (user.role !== 'admin') {
      user.role = 'admin';
      changed = true;
    }
    const valid = await user.comparePassword(env.ADMIN_SEED_PASSWORD);
    if (!valid) {
      user.password = env.ADMIN_SEED_PASSWORD;
      changed = true;
    }
    if (changed) await user.save();
    logger.info('Admin user ready', { email });
    return;
  }

  await User.create({
    name: env.ADMIN_SEED_NAME,
    email,
    password: env.ADMIN_SEED_PASSWORD,
    role: 'admin',
    isVerified: true,
  });
  logger.info('Default admin created', { email });
}
