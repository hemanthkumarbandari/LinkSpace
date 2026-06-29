import { logger } from '../utils/logger.js';

export type NotificationEvent =
  | 'meeting.started'
  | 'meeting.ended'
  | 'attendance.recorded'
  | 'recording.ready';

export async function emitLmsWebhook(
  event: NotificationEvent,
  payload: Record<string, unknown>
): Promise<void> {
  logger.info('LMS webhook placeholder', { event, payload });
}
