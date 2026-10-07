export default function CameraSection() {
  return (
    <section id="camera" className="h-svh w-full flex items-end md:items-center justify-start px-6 md:px-[12%] pb-14 md:pb-0 relative">
      <div className="max-w-xl">
        <p className="sg-eyebrow mb-3 md:mb-5">Camera</p>
        <h2 className="sg-title text-4xl md:text-7xl mb-4 md:mb-6 drop-shadow-xl">
          Pro-Grade <br />
          <strong className="sg-ai">Optical Power.</strong>
        </h2>
        <p className="text-white/55 text-base md:text-xl font-light leading-relaxed mb-6 md:mb-10">
          A 200MP main sensor, a 50MP ultra-wide and two telephoto lenses (3x and 5x)
          capture stunning detail, even in low light with Nightography.
        </p>

        <div className="flex gap-10 md:gap-14">
          <div>
            <p className="text-4xl md:text-6xl font-extralight tracking-tight">
              200<span className="text-lg md:text-2xl text-white/50">MP</span>
            </p>
            <p className="sg-eyebrow mt-2 !text-[0.65rem]">Main sensor</p>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-extralight tracking-tight">
              5<span className="text-lg md:text-2xl text-white/50">x</span>
            </p>
            <p className="sg-eyebrow mt-2 !text-[0.65rem]">50MP telephoto</p>
          </div>
        </div>
      </div>
    </section>
  );
}