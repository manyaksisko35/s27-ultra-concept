// Güvenlik ve yazılım: Samsung'un ürün sayfalarındaki Knox, Personal Data Engine, One UI 8.5 ve
// Quick Share (Apple AirDrop uyumu) bilgileri. Statik bölüm.

const ITEMS = [
  {
    eyebrow: 'Secured by Knox',
    title: 'Knox Vault',
    text: 'Your most sensitive data is encrypted and kept on the device with KEEP and Knox Vault, making it harder for anyone else to reach.',
  },
  {
    eyebrow: 'Personal Data Engine',
    title: 'Your data, processed safely',
    text: 'Personal data is gathered and processed on your phone, then encrypted. You decide whether Galaxy AI runs on-device or in the cloud.',
  },
  {
    eyebrow: 'One UI 8.5 · Android 16',
    title: 'Personal by design',
    text: 'One UI 8.5 adapts your Galaxy to how you use it day-to-day.',
  },
  {
    eyebrow: 'Quick Share',
    title: 'Now shares with iPhone',
    text: 'Send and receive photos, videos and files between supported Galaxy and Apple devices that support AirDrop, after the latest software update.',
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="sg-ambient amb-indigo relative z-10 bg-[#030303] px-6 md:px-[12%] pt-24 md:pt-36 pb-12 md:pb-16">
      <p className="sg-eyebrow mb-5">Security &amp; Software</p>
      <h2 className="sg-title text-4xl md:text-7xl mb-10 md:mb-16">
        Protected inside. <br />
        <strong className="sg-ai">Open to everyone.</strong>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
        {ITEMS.map((it) => (
          <div key={it.title} className="sg-card p-7 md:p-9">
            <p className="sg-eyebrow !text-[0.65rem] mb-3">{it.eyebrow}</p>
            <h3 className="text-2xl md:text-3xl font-semibold mb-2">{it.title}</h3>
            <p className="text-white/55 font-light">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
