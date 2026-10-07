const AI_FEATURES = [
  { title: 'Now Nudge', text: 'Surfaces the right info at the right moment, inside your conversations.' },
  { title: 'Circle to Search', text: 'Circle anything on screen to search it instantly.' },
  { title: 'Live Translate', text: 'Real-time call and conversation translation, on device.' },
  { title: 'Photo Assist', text: 'Edit, erase and restyle photos with generative tools.' },
];

export default function GalaxyAI() {
  return (
    <section id="galaxy-ai" className="relative z-10 bg-[#030303] px-6 md:px-[12%] pt-28 md:pt-40 pb-16 md:pb-20">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

      <p className="sg-eyebrow mb-5 relative">Galaxy AI</p>
      <h2 className="sg-title text-5xl md:text-8xl mb-6 relative">
        <span className="sg-ai font-semibold">Intelligence</span>
        <br />that gets you.
      </h2>
      <p className="text-white/55 text-lg md:text-xl font-light max-w-xl mb-16 relative">
        AI that works quietly in the background and shows up exactly when you need it.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl relative">
        {AI_FEATURES.map((f) => (
          <div key={f.title} className="sg-card p-8">
            <h3 className="text-2xl font-semibold mb-2">{f.title}</h3>
            <p className="text-white/55 font-light">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}