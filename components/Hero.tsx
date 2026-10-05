export default function Hero() {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center text-center relative pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/0 via-[#030303]/0 to-[#030303] z-[-1]" />
      <h1 className="text-[12vw] leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-300 to-gray-800 uppercase">
        S26 Ultra
      </h1>
      <p className="mt-6 text-xl md:text-2xl font-light tracking-[0.3em] text-cyan-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
        TITANIUM EVOLUTION
      </p>
    </section>
  );
}