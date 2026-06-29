'use client';

import { useEffect, useRef } from 'react';

interface ScreenShareVideoProps {
  stream: MediaStream;
  label: string;
}

export function ScreenShareVideo({ stream, label }: ScreenShareVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }
    void el.play().catch(() => {});
  }, [stream]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <span className="mb-1 text-xs text-slate-400">{label}</span>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className="h-full min-h-[200px] w-full flex-1 rounded-lg bg-black object-contain"
      />
    </div>
  );
}
