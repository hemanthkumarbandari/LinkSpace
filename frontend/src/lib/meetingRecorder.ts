import { useMediaStore } from '@/store/mediaStore';
import { useParticipantStore } from '@/store/participantStore';
import { useMeetingStore } from '@/store/meetingStore';

type RecordingSource = {
  key: string;
  stream: MediaStream;
};

export function getRecordingSources(): RecordingSource[] {
  const { localStream, screenStream } = useMediaStore.getState();
  const { peers } = useParticipantStore.getState();
  const localPeerId = useMeetingStore.getState().localPeerId;

  const sources: RecordingSource[] = [];
  const seen = new Set<string>();

  const add = (key: string, stream: MediaStream | undefined | null) => {
    if (!stream || seen.has(key)) return;
    if (!stream.getTracks().some((t) => t.readyState === 'live')) return;
    seen.add(key);
    sources.push({ key, stream });
  };

  add('local-screen', screenStream);
  for (const peer of peers.values()) {
    add(`${peer.peerId}-screen`, peer.screenStream);
  }
  if (localPeerId) add(`${localPeerId}-cam`, localStream);
  for (const peer of peers.values()) {
    add(`${peer.peerId}-cam`, peer.stream);
  }

  return sources;
}

export function createCompositeRecordingStream(): {
  stream: MediaStream;
  cleanup: () => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const videoEls = new Map<string, HTMLVideoElement>();
  const audioContext = new AudioContext();
  const audioDest = audioContext.createMediaStreamDestination();
  const audioSources: MediaStreamAudioSourceNode[] = [];
  const wiredAudio = new Set<string>();

  const attachAudio = (stream: MediaStream) => {
    const track = stream.getAudioTracks().find((t) => t.readyState === 'live');
    if (!track) return;
    const id = track.id;
    if (wiredAudio.has(id)) return;
    wiredAudio.add(id);
    const src = audioContext.createMediaStreamSource(new MediaStream([track]));
    src.connect(audioDest);
    audioSources.push(src);
  };

  const syncVideos = (sources: RecordingSource[]) => {
    const activeKeys = new Set(sources.map((s) => s.key));

    for (const s of sources) {
      attachAudio(s.stream);
      let el = videoEls.get(s.key);
      if (!el) {
        el = document.createElement('video');
        el.muted = true;
        el.playsInline = true;
        videoEls.set(s.key, el);
      }
      if (el.srcObject !== s.stream) {
        el.srcObject = s.stream;
        void el.play().catch(() => {});
      }
    }

    for (const key of [...videoEls.keys()]) {
      if (!activeKeys.has(key)) {
        videoEls.get(key)!.srcObject = null;
        videoEls.delete(key);
      }
    }
  };

  const drawFrame = () => {
    const sources = getRecordingSources();
    syncVideos(sources);

    const { width, height } = canvas;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const n = sources.length;
    if (n === 0) return;

    const cols = n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const cellW = width / cols;
    const cellH = height / rows;

    sources.forEach((s, i) => {
      const el = videoEls.get(s.key);
      if (!el || el.readyState < 2) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      ctx.drawImage(el, col * cellW, row * cellH, cellW, cellH);
    });
  };

  const interval = window.setInterval(drawFrame, 1000 / 15);
  drawFrame();

  const canvasStream = canvas.captureStream(15);
  const combined = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioDest.stream.getAudioTracks(),
  ]);

  const cleanup = () => {
    clearInterval(interval);
    videoEls.forEach((el) => {
      el.srcObject = null;
    });
    videoEls.clear();
    audioSources.forEach((s) => s.disconnect());
    audioDest.disconnect();
    void audioContext.close().catch(() => {});
    canvasStream.getTracks().forEach((t) => t.stop());
  };

  return { stream: combined, cleanup };
}
