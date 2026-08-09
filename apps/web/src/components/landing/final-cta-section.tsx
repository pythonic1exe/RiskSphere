'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

import { DarkVeil } from '@/components/react-bits';

export function FinalCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="cta" className="relative isolate flex min-h-[min(78svh,52rem)] items-center justify-center overflow-hidden bg-bg-base px-6 py-32 sm:px-8 lg:px-12">
      {!prefersReducedMotion && (
        <div className="absolute inset-0 opacity-75">
          <DarkVeil hueShift={0} noiseIntensity={0} scanlineIntensity={0} speed={0.22} warpAmount={0.08} resolutionScale={1} />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,20,0.42),rgba(7,11,20,0.68)_58%,rgba(7,11,20,0.96))]" />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <p className="font-brand text-[0.6rem] uppercase tracking-[0.22em] text-text-muted sm:text-xs sm:tracking-[0.3em]">
          Risk <span className="text-primary/80">→</span> Requirement <span className="text-primary/80">→</span> Control <span className="text-primary/80">→</span> Execution <span className="text-primary/80">→</span> Evidence <span className="text-primary/80">→</span> Audit
        </p>
        <h2 className="mt-8 font-heading text-5xl leading-[0.98] tracking-[-0.05em] text-text-primary sm:text-6xl lg:text-7xl">
          Make GRC operational.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-text-secondary sm:text-lg">
          Bring risks, controls, evidence and audits into one connected system.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <Link href="/signin" className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-bg-base">
            Sign in
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
