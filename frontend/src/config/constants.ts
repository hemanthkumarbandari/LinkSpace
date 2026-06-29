export { getApiUrl, getSocketUrl, isCrossOriginBackend, resolveUrls } from './urls';

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'LinkSpace';

export const REACTION_EMOJIS = ['👍', '👏', '❤️', '😂', '🎉', '🔥', '😮'] as const;
