export default function Features() {
  return (
    <section className="h-svh w-full flex items-end md:items-center justify-end px-4 md:px-[10%] pb-8 md:pb-0 relative">
      <div className="grid grid-cols-2 gap-3 md:gap-5 max-w-3xl w-full">

        <div className="sg-card col-span-2 relative p-5 md:p-9 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500/15 blur-[90px] rounded-full pointer-events-none" />
          <p className="sg-eyebrow mb-2 md:mb-4 !text-[0.6rem] md:!text-xs">Display</p>
          <h3 className="sg-title text-2xl md:text-5xl mb-2 md:mb-4">
            6.9<span className="text-lg md:text-2xl text-white/50">&quot;</span> <strong>Dynamic AMOLED 2X</strong>
          </h3>
          <p className="text-white/55 font-light text-sm md:text-lg">
            QHD+ clarity, 120Hz adaptive refresh and up to 2600 nits, with an anti-reflective
            Gorilla Armor 2 and a built-in Privacy Display.
          </p>
        </div>

        <div className="sg-card p-4 md:p-8">
          <p className="sg-eyebrow mb-2 md:mb-3 !text-[0.6rem] md:!text-xs">Memory</p>
          <h3 className="text-2xl md:text-4xl font-light tracking-tight mb-1 md:mb-2">
            12<span className="text-sm md:text-xl text-white/50">GB</span>
            <span className="text-white/30"> / </span>
            16<span className="text-sm md:text-xl text-white/50">GB</span>
          </h3>
          <p className="text-white/55 font-light text-xs md:text-sm">
            LPDDR5X for heavy multitasking and on-device AI.
          </p>
        </div>

        <div className="sg-card relative p-4 md:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
          <p className="sg-eyebrow mb-2 md:mb-3 relative !text-[0.6rem] md:!text-xs">Chipset</p>
          <h3 className="text-lg md:text-2xl font-semibold tracking-tight mb-1 md:mb-2 relative">Snapdragon 8 Elite Gen 5</h3>
          <p className="text-white/55 font-light text-xs md:text-sm relative">
            3nm chip with a faster NPU and a redesigned Vapor Chamber.
          </p>
        </div>

      </div>
    </section>
  );
}