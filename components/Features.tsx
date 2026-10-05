import { Zap, Cpu, Maximize } from 'lucide-react';

export default function Features() {
  return (
    <section className="h-screen w-full flex items-center justify-end px-[5%] md:px-[10%] relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
        
        {/* Geniş Kart - 144Hz Dynamic AMOLED */}
        <div className="md:col-span-2 group relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl overflow-hidden hover:bg-white/[0.04] transition-colors duration-500">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
          <Maximize className="text-cyan-400 w-8 h-8 mb-4" />
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">144Hz AMOLED 2X</h3>
          <p className="text-gray-400 font-light text-lg">
            Rekabetçi oyunlar ve akıcı arayüz deneyimi için kusursuz optimize edilmiş 144Hz yenileme hızı.
          </p>
        </div>

        {/* Küçük Kart - RAM */}
        <div className="relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl overflow-hidden hover:bg-white/[0.04] transition-colors duration-500">
          <Zap className="text-purple-400 w-8 h-8 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">16GB LPDDR5X</h3>
          <p className="text-gray-400 font-light text-sm">
            Yüksek hızlı bellek kapasitesiyle en ağır projelerde ve çoklu görevlerde kesintisiz performans.
          </p>
        </div>

        {/* Küçük Kart - İşlemci */}
        <div className="relative p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl overflow-hidden hover:bg-white/[0.04] transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent blur-[40px] pointer-events-none" />
          <Cpu className="text-cyan-400 w-8 h-8 mb-4 relative z-10" />
          <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Snapdragon 8 Gen 5</h3>
          <p className="text-gray-400 font-light text-sm relative z-10">
            Yeni nesil yapay zeka çekirdekleriyle donatılmış, güç tüketiminde zirve işlemci mimarisi.
          </p>
        </div>

      </div>
    </section>
  );
}