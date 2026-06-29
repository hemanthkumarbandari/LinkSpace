'use client';

import { useEffect, useRef } from 'react';
import { Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecordingStore } from '@/store/recordingStore';
import { createCompositeRecordingStream } from '@/lib/meetingRecorder';
import { toast } from 'sonner';
import { useMeetingStore } from '@/store/meetingStore';
import { useParticipantStore } from '@/store/participantStore';

interface RecordButtonProps {
  meetingId: string;
}

function pickMimeType(): string | undefined {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=opus',
    'video/webm',
    'video/mp4',
  ];
  return candidates.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t));
}

export function RecordButton({ meetingId }: RecordButtonProps) {
  const isRecording = useRecordingStore((s) => s.isRecording);
  const isUploading = useRecordingStore((s) => s.isUploading);
  const setRecording = useRecordingStore((s) => s.setRecording);
  const setUploading = useRecordingStore((s) => s.setUploading);
  const meetingStatus = useMeetingStore((s) => s.status);
  const localPeer = useParticipantStore((s) => s.localPeer);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const isHost = localPeer?.role === 'host';

  const download = (blob: Blob, durationMs: number) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-${new Date().toISOString().replaceAll(':', '-')}-${Math.max(
      1,
      Math.round(durationMs / 1000)
    )}s.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const start = async () => {
    if (!isHost) {
      toast.error('Only the meeting host can record');
      return;
    }
    if (isRecording || isUploading) return;
    if (meetingStatus === 'ended') {
      toast.error('Meeting has ended');
      return;
    }
    if (meetingStatus !== 'connected') {
      toast.error('Join the meeting before recording');
      return;
    }

    try {
      const { stream, cleanup } = createCompositeRecordingStream();
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const durationMs = Date.now() - startedAtRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeType ?? 'video/webm' });
        chunksRef.current = [];

        cleanupRef.current?.();
        cleanupRef.current = null;

        setUploading(true);
        try {
          download(blob, durationMs);
          toast.success('Recording downloaded');
        } finally {
          setUploading(false);
        }
      };

      cleanupRef.current = cleanup;
      recorderRef.current = recorder;
      recorder.start(1000);
      setRecording(true);
      toast.success('Recording started (all participants + screen shares)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start recording';
      toast.error(message);
    }
  };

  const stop = () => {
    const r = recorderRef.current;
    if (!r || r.state === 'inactive') return;
    setRecording(false);
    r.stop();
    recorderRef.current = null;
  };

  useEffect(() => {
    if (meetingStatus === 'ended') stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingStatus]);

  if (!isHost) return null;

  return (
    <Button
      variant={isRecording ? 'destructive' : 'secondary'}
      size="icon"
      onClick={() => void (isRecording ? stop() : start())}
      disabled={isUploading}
      title={isRecording ? 'Stop recording' : 'Record meeting (host only)'}
    >
      {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
    </Button>
  );
}
