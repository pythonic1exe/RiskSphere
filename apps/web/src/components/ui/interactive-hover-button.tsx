import type { ComponentPropsWithoutRef } from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={cn(
        'group relative inline-flex w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border-default bg-transparent px-3 py-1.5 text-center text-sm font-medium text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 z-0 scale-[0.22] rounded-[inherit] bg-primary opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
      <div className="relative z-10 flex items-center justify-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[36] group-hover:bg-primary-active group-focus-visible:scale-[36] group-focus-visible:bg-primary-active" />
        <span className="inline-block transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-6 group-hover:opacity-0 group-focus-visible:-translate-x-6 group-focus-visible:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute inset-0 z-10 flex h-full w-full translate-x-6 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        <span>{children}</span>
        <ArrowRight className="size-3.5" />
      </div>
    </button>
  );
}
