import { env } from './env.config.js';

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export const iceServers: IceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(env.TURN_SERVER_IP && env.TURN_USERNAME && env.TURN_PASSWORD
    ? [
        {
          urls: `turn:${env.TURN_SERVER_IP}:3478`,
          username: env.TURN_USERNAME,
          credential: env.TURN_PASSWORD,
        },
      ]
    : []),
];
