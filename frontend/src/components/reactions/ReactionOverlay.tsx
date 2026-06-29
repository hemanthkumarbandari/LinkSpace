'use client';

import { useUiStore } from '@/store/uiStore';

export function ReactionOverlay() {
  const reactions = useUiStore((s) => s.activeReactions);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {reactions.map((r, i) => (
        <div
          key={r.id}
          className="absolute bottom-24 animate-bounce text-4xl"
          style={{
            left: `${20 + (i % 5) * 15}%`,
            animation: 'float-up 3s ease-out forwards',
          }}
        >
          {r.emoji}
        </div>
      ))}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px);
          }
        }
      `}</style>
    </div>
  );
}
