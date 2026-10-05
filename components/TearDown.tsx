export default function TearDown() {
  return (
    <section className="h-screen w-full flex items-center justify-start px-[5%] md:px-[10%] relative pointer-events-none">
      <div className="max-w-xl">
        <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-transparent mb-6" />
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white drop-shadow-xl">
          Kusursuz <br /> Mimari.
        </h2>
        <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
          Geliştirilmiş Grade-5 Titanyum çerçeve ve optimize edilmiş <span className="text-cyan-400 font-semibold">Vapor Chamber</span> termal yönetim sistemi. Agresif güç, sıfır ısınma.
        </p>
      </div>
    </section>
  );
}