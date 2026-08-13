'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { Button, buttonVariants } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
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
import { RiskSphereBrand } from '@/components/brand/risksphere-brand';

const links = [
  { label: 'Lifecycle', href: '#platform' },
  { label: 'Tenancy', href: '#tenancy' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Get Started', href: '/onboarding' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState(links[0]?.href ?? '#platform');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 32);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    const doc = globalThis.document;
    const sectionIds = links
      .map((link) => link.href.replace('#', ''))
      .filter(Boolean);

    const sections = sectionIds
      .map((id) => doc.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const syncFromHash = () => {
      const currentHash = window.location.hash;

      if (currentHash && links.some((link) => link.href === currentHash)) {
        setActiveHref(currentHash);
      }
    };

    syncFromHash();

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const visibleId = visibleEntries[0]?.target.getAttribute('id');

        if (!visibleId) {
          return;
        }

        const nextHref = `#${visibleId}`;

        if (links.some((link) => link.href === nextHref)) {
          setActiveHref(nextHref);
        }
      },
      {
        rootMargin: '-32% 0px -48% 0px',
        threshold: [0.2, 0.35, 0.5, 0.65],
      }
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener('hashchange', syncFromHash);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <motion.div
        animate={{
          width: scrolled ? '60%' : '100%',
          paddingLeft: scrolled ? 10 : 16,
          paddingRight: scrolled ? 10 : 16,
          paddingTop: scrolled ? 6 : 12,
          paddingBottom: scrolled ? 6 : 12,
          borderRadius: scrolled ? 22 : 28,
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto max-w-[92rem] border border-white/8 bg-[linear-gradient(180deg,rgba(23,32,51,0.62),rgba(11,18,32,0.4))] shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl ring-1 ring-white/5 lg:data-[scrolled=true]:w-[80%]"
        data-scrolled={scrolled}
        style={{
          width: '100%',
          borderRadius: 28,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="RiskSphere home"><RiskSphereBrand logoClassName="size-8" /></Link>

          <nav
            className="hidden items-center rounded-full border border-white/8 bg-[rgba(17,24,39,0.62)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const isActive = activeHref === link.href;
              const interactionProps = prefersReducedMotion
                ? {}
                : {
                    whileHover: { scale: 1.02, y: -1 },
                    whileTap: { scale: 0.985 },
                  };

              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveHref(link.href)}
                  {...interactionProps}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                    isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="navbar-pill-active"
                      className="absolute inset-0 -z-10 rounded-full border border-primary/20 bg-[linear-gradient(180deg,rgba(23,32,51,0.96),rgba(17,24,39,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 32,
                        mass: 0.7,
                      }}
                    />
                  ) : null}
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{link.label}</span>
                    <AnimatePresence initial={false}>
                      {isActive ? (
                        <motion.span
                          key={`${link.href}-dot`}
                          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          {...(prefersReducedMotion
                            ? {}
                            : { exit: { opacity: 0, scale: 0.6 } })}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                          className="size-1.5 rounded-full bg-primary"
                        />
                      ) : null}
                    </AnimatePresence>
                  </span>
                </motion.a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login">
              <InteractiveHoverButton className="h-8 rounded-[12px] border-white/10 px-3.5 py-0 text-[0.82rem] text-text-primary/92 hover:border-primary/50 focus-visible:ring-offset-transparent">
                Sign In
              </InteractiveHoverButton>
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
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'justify-center')}
                >
                  Sign In
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>
    </header>
  );
}
