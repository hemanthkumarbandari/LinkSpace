const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateMeetingId(length = 8): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return id;
}
