import type { Metadata } from 'next';
import { Inter, Poppins, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: false, // Disable preload to avoid unused resource warnings
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading-alt',
  display: 'swap',
  preload: false,
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
  preload: false, // Disable preload to avoid unused resource warnings
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
      <body className={cn(inter.variable, poppins.variable, montserrat.variable, inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
