'use client';

import { type PropsWithChildren } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { QueryProvider } from './query-provider';
import { AuthProvider } from '@/features/auth/auth-provider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <TooltipProvider><AuthProvider>{children}</AuthProvider></TooltipProvider>
    </QueryProvider>
  );
}
