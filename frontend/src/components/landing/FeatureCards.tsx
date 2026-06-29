const features = [
  { title: 'HD Video', desc: 'VP8, VP9, and H264 codecs for adaptive quality.' },
  { title: 'Screen Share', desc: 'Share your screen with one click.' },
  { title: 'LMS Ready', desc: 'Attendance, batches, and recordings for education.' },
];

export function FeatureCards() {
  return (
    <section className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
          <p className="text-sm text-slate-600">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}
