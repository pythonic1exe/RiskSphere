import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { DarkVeil } from '@/components/react-bits';
import { buttonVariants } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[calc(100svh+12rem)] overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.02),transparent_30%),radial-gradient(circle_at_76%_28%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_82%_58%,rgba(34,211,238,0.12),transparent_24%),linear-gradient(180deg,rgba(11,18,32,0.92),rgba(11,18,32,0.78)_58%,rgba(7,11,20,0.98))]">
        <DarkVeil />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent via-bg-app/20 to-bg-app" />
      <div className="relative mx-auto flex max-w-[92rem] justify-center px-6 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-[48rem] pt-6 pb-24 text-center lg:pt-12 lg:pb-32">
          <div className="mx-auto max-w-[38rem]">
            <p className="font-brand text-xs uppercase tracking-[0.34em] text-brand-accent/80">
              Governance / Risk / Compliance
            </p>
            <h1 className="mx-auto mt-6 max-w-[12ch] font-heading text-[3.8rem] leading-[0.92] tracking-[-0.05em] text-text-primary sm:text-6xl lg:text-[4.35rem] xl:text-[4.75rem]">
              <span className="block">Govern risk.</span>
              <span className="block">Prove compliance.</span>
              <span className="block">Stay audit-ready.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-text-secondary">
              RiskSphere connects risks, requirements, controls, recurring execution, evidence,
              and audits in one tenant-scoped platform so governance teams can act with
              traceability instead of spreadsheets.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6">
              <Link href="#cta" className={buttonVariants({ size: 'lg' })}>
                Request demo
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="#platform"
                className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Explore the platform
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
