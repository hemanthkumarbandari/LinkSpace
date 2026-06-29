'use client';

import { useEffect, useRef } from 'react';

interface PreviewVideoProps {
  stream: MediaStream | null;
  mirrored?: boolean;
}

export function PreviewVideo({ stream, mirrored = true }: PreviewVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className={`h-full w-full rounded-xl bg-zinc-900 object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
    />
  );
}
