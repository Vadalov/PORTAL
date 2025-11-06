import type { Metadata } from 'next';
import { Inter, Poppins, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { WebVitalsTracker } from '@/components/analytics/WebVitalsTracker';

// Optimized font loading with subset optimization
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap', // Swap to fallback font immediately, then swap to web font
  preload: true, // Preload for better performance
  fallback: ['system-ui', 'arial'], // Fallback fonts
  adjustFontFallback: true, // Adjust font metrics for better CLS
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading-alt',
  display: 'swap',
  preload: false, // Don't preload secondary font
  fallback: ['system-ui', 'sans-serif'] as string[],
  adjustFontFallback: true,
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
  preload: false, // Don't preload secondary font
  fallback: ['system-ui', 'sans-serif'] as string[],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'Dernek Yönetim Sistemi',
  description: 'Modern dernek yönetim sistemi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={cn(inter.variable, poppins.variable, montserrat.variable, inter.className)}>
        <Providers>
          <WebVitalsTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
