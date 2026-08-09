import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppProviders } from '@/providers/app-providers';
import { inter, orbitron, spaceGrotesk } from '@/lib/fonts';

import './globals.css';

export const metadata: Metadata = {
  title: 'RiskSphere',
  description: 'GRC & Audit Management Platform',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
