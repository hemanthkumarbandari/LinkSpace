export function WaitingRoom() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f]">
      <div className="relative mb-8">
        <div className="h-24 w-24 animate-pulse rounded-full border-4 border-blue-500/30" />
        <div className="absolute inset-2 animate-ping rounded-full border-2 border-blue-500" />
      </div>
      <h2 className="text-xl font-semibold text-white">
        Waiting for host to admit you...
      </h2>
      <p className="mt-2 text-zinc-500">You will join automatically once admitted.</p>
    </div>
  );
}
