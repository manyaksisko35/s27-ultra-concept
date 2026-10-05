export default function Teardown() {
  return (
    <section className="h-screen w-full flex items-center justify-start px-[8%] md:px-[12%] relative pointer-events-none">
      <div className="max-w-xl">
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent mb-6" />
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-xl">
          Engineered for <br /> <span className="text-cyan-400">Absolute Power.</span>
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
          Redesigned thermal architecture equipped with an advanced Vapor Chamber system. 
          Built to sustain peak performance under heavy loads without breaking a sweat.
        </p>
      </div>
    </section>
  );
}