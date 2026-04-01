import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const displayFont = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Vectra Marketplace — Production-ready React components',
  description:
    'Browse, preview, and install production-ready React components for your Vectra Studio projects. Official and community components for Next.js and Vite.',
  openGraph: {
    title: 'Vectra Marketplace',
    description: 'Production-ready React components for Vectra Studio',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'light') {
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
              }
            } catch (_) {}
          `
        }} />
      </head>
      <body className="bg-m3-background text-m3-onBackground font-body antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
