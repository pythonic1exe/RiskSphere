'use client';

import { type PropsWithChildren } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { QueryProvider } from './query-provider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryProvider>
  );
}
