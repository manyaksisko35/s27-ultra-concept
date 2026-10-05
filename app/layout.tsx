import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Samsung Galaxy S27 Ultra | The New Era',
  description: 'Beyond Titanium. 240Hz OLED, 32GB RAM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="antialiased bg-[#030303] text-white selection:bg-cyan-500/30">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}