import type { Transport, Producer, Consumer } from 'mediasoup-client/types';

export const mediasoupSession = {
  sendTransport: null as Transport | null,
  recvTransport: null as Transport | null,
  producers: new Map<string, Producer>(),
  consumers: new Map<string, Consumer>(),
  consumedProducerIds: new Set<string>(),
  joining: false,
};

export function resetMediasoupSession(): void {
  mediasoupSession.sendTransport?.close();
  mediasoupSession.recvTransport?.close();
  mediasoupSession.producers.forEach((p) => p.close());
  mediasoupSession.consumers.forEach((c) => c.close());
  mediasoupSession.producers.clear();
  mediasoupSession.consumers.clear();
  mediasoupSession.consumedProducerIds.clear();
  mediasoupSession.sendTransport = null;
  mediasoupSession.recvTransport = null;
  mediasoupSession.joining = false;
}
