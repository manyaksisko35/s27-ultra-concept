import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Samsung Galaxy S26 Ultra | The New Standard',
  description: 'Built with Titanium and Snapdragon 8 Gen 5.',
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