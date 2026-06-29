import type {
  Worker,
  Router,
  WebRtcTransport,
  Producer,
  Consumer,
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
} from 'mediasoup/types';

export type {
  Worker,
  Router,
  WebRtcTransport,
  Producer,
  Consumer,
  RtpCapabilities,
  DtlsParameters,
  MediaKind,
  RtpParameters,
};

export interface TransportConnectData {
  meetingId: string;
  transportId: string;
  dtlsParameters: DtlsParameters;
}

export interface ProduceData {
  meetingId: string;
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData?: Record<string, unknown>;
}

export interface ConsumeData {
  meetingId: string;
  producerId: string;
  rtpCapabilities: RtpCapabilities;
}
