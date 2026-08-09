import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { DarkVeil } from '@/components/react-bits';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FinalCtaSection() {
  return (
    <section id="cta" className="relative isolate overflow-hidden border-y border-border-subtle px-6 py-24 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 opacity-45">
        <DarkVeil hueShift={8} noiseIntensity={0.02} speed={0.22} resolutionScale={0.7} />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,11,20,0.82),rgba(11,18,32,0.7))]" />
      <div className="mx-auto max-w-[92rem]">
        <div className="max-w-3xl">
          <p className="font-brand text-xs uppercase tracking-[0.32em] text-brand-accent/80">
            Request a demo
          </p>
          <h2 className="mt-4 max-w-4xl font-heading text-4xl leading-tight text-text-primary sm:text-5xl">
            Bring governance, risk, compliance, and audit into one platform
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
            See how RiskSphere keeps tenants isolated, workflows accountable, and evidence traceable from the first risk record to final closure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signin" className={buttonVariants({ size: 'lg' })}>
              Contact sales
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="#platform"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              Review lifecycle
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
