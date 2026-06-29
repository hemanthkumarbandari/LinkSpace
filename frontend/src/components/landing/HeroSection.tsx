import { APP_NAME } from '@/config/constants';

export function HeroSection() {
  return (
    <section className="text-center">
      <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
        {APP_NAME}
      </h1>
      <p className="mx-auto mb-6 max-w-xl text-lg text-slate-600">
        Crystal-clear video meetings powered by WebRTC. Host, join, and collaborate in seconds.
      </p>
    </section>
  );
}
