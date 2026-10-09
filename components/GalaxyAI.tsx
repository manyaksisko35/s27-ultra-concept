const AI_FEATURES = [
  { title: 'Now Nudge', text: 'Surfaces the right info at the right moment, inside your conversations.' },
  { title: 'Circle to Search', text: 'Circle anything on screen to search it instantly.' },
  { title: 'Live Translate', text: 'Real-time call and conversation translation, on device.' },
  { title: 'Photo Assist', text: 'Describe the edit in your own words and Galaxy AI does it, quickly and easily.' },
  { title: 'Creative Studio', text: 'Turn your photos into sticker sets and other creations at the tap of a button.' },
  { title: 'Audio Eraser', text: 'Cut background noise from videos and use Voice Focus to hear every word clearly.' },
  { title: 'Now Brief', text: 'Bite-sized briefs through the day: bookings, travel moments and workout playlists.' },
  { title: 'Super Steady', text: 'Horizontal Lock keeps video level, even while you run.' },
];

import AIDemos from '@/components/AIDemos';

export default function GalaxyAI() {
  return (
    <section id="galaxy-ai" className="sg-ambient amb-violet relative z-10 bg-[#030303] px-6 md:px-[12%] pt-28 md:pt-40 pb-16 md:pb-20">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

      <p className="sg-eyebrow mb-5 relative">Galaxy AI</p>
      <h2 className="sg-title text-5xl md:text-8xl mb-6 relative">
        <span className="sg-ai font-semibold">Intelligence</span>
        <br />that gets you.
      </h2>
      <p className="text-white/55 text-lg md:text-xl font-light max-w-xl mb-10 md:mb-14 relative">
        AI that works quietly in the background and shows up exactly when you need it.
      </p>

      {/* Canlı demolar */}
      <AIDemos />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl relative">
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