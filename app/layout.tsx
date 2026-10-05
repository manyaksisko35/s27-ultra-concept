import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Samsung Galaxy S26 Ultra | Titanium Evolution',
  description: 'Awwwards-grade 3D Interactive Concept Experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased selection:bg-cyan-500/30" suppressHydrationWarning>
      <body className="bg-[#030303] text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}