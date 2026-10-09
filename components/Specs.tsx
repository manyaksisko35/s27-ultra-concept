const SPECS: [string, string][] = [
  ['Display', '6.9" Dynamic AMOLED 2X, 3120 x 1440, 120Hz'],
  ['Processor', 'Snapdragon 8 Elite Gen 5 for Galaxy'],
  ['Memory', '12GB (256GB / 512GB) · 16GB (1TB) LPDDR5X'],
  ['Storage', '256GB / 512GB / 1TB'],
  ['Main camera', '200MP wide + 50MP ultra-wide'],
  ['Telephoto', '50MP 5x + 10MP 3x'],
  ['Front camera', '12MP'],
  ['Battery', '5,000mAh'],
  ['Build', '7.9mm, 214g, IP68, S Pen'],
];

export default function Specs() {
  return (
    <section id="specs" className="relative z-10 bg-[#030303] px-6 md:px-[12%] pt-24 md:pt-32 pb-12">
      <p className="sg-eyebrow mb-5">Specifications</p>
      <h2 className="sg-title text-5xl md:text-7xl mb-10 md:mb-16">
        Tech <strong>specs</strong>
      </h2>

      <dl className="max-w-4xl divide-y divide-white/10 border-y border-white/10">
        {SPECS.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-6">
            <dt className="text-white/50 font-light">{k}</dt>
            <dd className="font-medium text-right">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 flex gap-4">
        <a href="#" className="sg-btn">Pre-order now</a>
        <a href="#compare" className="sg-btn sg-btn--ghost">Compare models</a>
      </div>

      <footer className="mt-20 md:mt-32 pt-8 border-t border-white/10 flex flex-col gap-2 md:flex-row md:justify-between text-xs text-white/40">
        <span className="tracking-[0.3em]">SAMSUNG</span>
        <span className="md:text-right">
          Fan-made concept. Not affiliated with Samsung. Designed and Coded by Hasan Alp Güngör.
          <br />
          S Pen &amp; Galaxy S25 Ultra 3D models by{' '}
          <a href="https://sketchfab.com/vmmaniac" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            vmmaniac
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            CC BY 4.0
          </a>
          ).
        </span>
      </footer>
    </section>
  );
}