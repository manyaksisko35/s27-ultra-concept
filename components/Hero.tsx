export default function Hero() {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center text-center relative pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] z-[-1]" />
      
      {/* 
        1. filter: drop-shadow ile yazının arkasına zifiri karanlık bir gölge atılarak parlak 3D modelden koparıldı.
        2. fontFamily ile doğrudan Samsung Sharp Sans alternatifi olan Outfit fontu zorlandı.
      */}
      <h1 
        className="text-[13vw] leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-zinc-600 uppercase"
        style={{ 
          fontFamily: "'Outfit', sans-serif",
          filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.9)) drop-shadow(0px 4px 10px rgba(0,0,0,1))" 
        }}
      >
        S26 ULTRA
      </h1>
      
      <p 
        className="mt-6 text-lg md:text-2xl font-semibold tracking-[0.4em] text-cyan-400"
        style={{ 
          fontFamily: "'Outfit', sans-serif",
          filter: "drop-shadow(0px 0px 20px rgba(6,182,212,0.8))"
        }}
      >
        TITANIUM EVOLUTION
      </p>
    </section>
  );
}