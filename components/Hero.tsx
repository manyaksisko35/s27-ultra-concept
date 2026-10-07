export default function Hero() {
  return (
    <section id="overview" className="h-svh w-full flex flex-col items-center justify-center text-center relative pointer-events-none px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] z-[-1]" />

      <p className="sg-eyebrow mb-4 md:mb-6 !text-[0.65rem] md:!text-xs" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.9))' }}>
        Galaxy AI is here
      </p>

      <h1
        className="sg-title text-[15vw] md:text-[9vw]"
        style={{ filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.9)) drop-shadow(0px 4px 10px rgba(0,0,0,1))' }}
      >
        Galaxy S26 <strong>Ultra</strong>
      </h1>

      <p
        className="mt-4 md:mt-6 text-base md:text-2xl font-light text-white/70"
        style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.9))' }}
      >
        Meet the most <span className="sg-ai font-semibold">intelligent Ultra.</span>
      </p>

      <div className="absolute bottom-8 md:bottom-10 flex flex-col items-center gap-3 text-white/50">
        <span className="sg-eyebrow !text-[0.65rem]">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}