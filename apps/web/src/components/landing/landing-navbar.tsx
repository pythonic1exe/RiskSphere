'use client';

import Link from 'next/link';
import { Bars3Icon, ChevronDownIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Security', href: '#security' },
  { label: 'Resources', href: '#resources' },
];

export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-[92rem] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(23,32,51,0.62),rgba(11,18,32,0.4))] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl ring-1 ring-white/5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheckIcon className="size-5" />
            </span>
            <span>
              <span className="font-brand block text-sm uppercase tracking-[0.28em] text-text-primary">
                RiskSphere
              </span>
              <span className="block text-xs text-text-muted">GRC &amp; Audit Management</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary transition-all duration-200 hover:text-text-primary hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.28)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/signin" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Sign In
            </Link>
            <Link href="#cta" className={buttonVariants({ size: 'sm' })}>
              Request Demo
            </Link>
          </div>

          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon-sm" aria-label="Open navigation" />}
              className="lg:hidden"
            >
              <Bars3Icon className="size-5" />
            </SheetTrigger>
          <SheetContent side="right" className="w-[320px] border-border-default bg-bg-elevated/95 backdrop-blur-2xl">
              <SheetHeader className="space-y-2 text-left">
                <SheetTitle className="font-heading text-2xl text-text-primary">Navigate RiskSphere</SheetTitle>
                <SheetDescription className="text-text-secondary">
                  Explore the platform, security, and enterprise architecture.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-8 space-y-2">
                {links.map((link) => (
                  <SheetClose key={link.label}>
                    <a
                      href={link.href}
                      className="flex items-center justify-between rounded-xl border border-transparent px-3 py-3 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                    >
                      {link.label}
                      <ChevronDownIcon className="size-4 -rotate-90 text-text-muted" />
                    </a>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                <Link href="#cta" className={buttonVariants({ size: 'default' })}>
                  Request Demo
                </Link>
                <Link
                  href="/signin"
                  className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}
                >
                  Sign In
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
