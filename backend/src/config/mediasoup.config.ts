import { env } from './env.config.js';
import type {
  WorkerSettings,
  RouterOptions,
  WebRtcTransportOptions,
} from 'mediasoup/types';

export const workerSettings: WorkerSettings = {
  logLevel: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
  rtcMinPort: 40000,
  rtcMaxPort: 40099,
};

export const routerOptions: RouterOptions = {
  mediaCodecs: [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: { 'x-google-start-bitrate': 1000 },
    },
    {
      kind: 'video',
      mimeType: 'video/VP9',
      clockRate: 90000,
      parameters: { 'profile-id': 2, 'x-google-start-bitrate': 1000 },
    },
    {
      kind: 'video',
      mimeType: 'video/H264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '4d0032',
        'level-asymmetry-allowed': 1,
        'x-google-start-bitrate': 1000,
      },
    },
  ],
};

export const webRtcTransportOptions: Partial<WebRtcTransportOptions> = {
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  initialAvailableOutgoingBitrate: 1000000,
};

export function getListenIps(): WebRtcTransportOptions['listenIps'] {
  return [
    {
      ip: env.MEDIASOUP_LISTEN_IP,
      announcedIp: env.MEDIASOUP_ANNOUNCED_IP || undefined,
    },
  ];
}
