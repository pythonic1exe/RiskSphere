'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';

type StageTone = 'danger' | 'warning' | 'success' | 'primary';

type LifecycleStage = {
  number: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  record: string;
  recordTitle: string;
  details: Array<{ label: string; value: string; tone?: StageTone }>;
};

const lifecycleStages: LifecycleStage[] = [
  {
    number: '01',
    title: 'Risk',
    summary: 'Identify what could impact the organization.',
    icon: TriangleAlert,
    record: 'RISK-104',
    recordTitle: 'Unauthorized privileged access',
    details: [
      { label: 'Impact', value: 'High', tone: 'danger' },
      { label: 'Likelihood', value: 'Medium', tone: 'warning' },
      { label: 'Exposure', value: 'HIGH', tone: 'danger' },
      { label: 'Owner', value: 'Infrastructure Team' },
    ],
  },
  {
    number: '02',
    title: 'Requirement',
    summary: 'Translate obligations into something actionable.',
    icon: BookOpenCheck,
    record: 'ISO 27001 · A.5.18',
    recordTitle: 'Access Rights',
    details: [
      { label: 'Framework', value: 'ISO 27001' },
      { label: 'Mapped controls', value: '3' },
      { label: 'Status', value: 'Mapped', tone: 'primary' },
    ],
  },
  {
    number: '03',
    title: 'Control',
    summary: 'Put governance into operation.',
    icon: ShieldCheck,
    record: 'CTRL-042',
    recordTitle: 'Quarterly Access Review',
    details: [
      { label: 'Owner', value: 'Sarah Chen' },
      { label: 'Frequency', value: 'Quarterly' },
      { label: 'Status', value: 'Operational', tone: 'success' },
    ],
  },
  {
    number: '04',
    title: 'Execution',
    summary: 'Turn controls into recurring work.',
    icon: RefreshCw,
    record: 'Q3 2026 Execution',
    recordTitle: 'CTRL-042',
    details: [
      { label: 'Due', value: 'Sep 30' },
      { label: 'Completed', value: 'Sep 21' },
      { label: 'Performed by', value: 'Sarah Chen' },
      { label: 'Status', value: 'Completed', tone: 'success' },
    ],
  },
  {
    number: '05',
    title: 'Evidence',
    summary: 'Keep proof attached to the work that produced it.',
    icon: FileCheck2,
    record: 'access-review-q3.pdf',
    recordTitle: 'Evidence submission',
    details: [
      { label: 'Uploaded', value: 'Sep 21' },
      { label: 'Uploaded by', value: 'Sarah Chen' },
      { label: 'Linked control', value: 'CTRL-042' },
      { label: 'Verified', value: 'Yes', tone: 'success' },
    ],
  },
  {
    number: '06',
    title: 'Audit',
    summary: 'Test what happened, not what teams remember.',
    icon: ClipboardCheck,
    record: 'AT-031',
    recordTitle: 'Access Review Effectiveness',
    details: [
      { label: 'Control', value: 'CTRL-042' },
      { label: 'Evidence tested', value: '4 files' },
      { label: 'Result', value: 'PASSED', tone: 'success' },
    ],
  },
];

const toneClasses: Record<StageTone, string> = {
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  primary: 'text-primary',
};

export function GrcLifecycleSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !pin || !viewport || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktopLayout = window.matchMedia('(min-width: 768px)').matches;

    if (reducedMotion || !desktopLayout) {
      setActiveIndex(reducedMotion ? lifecycleStages.length - 1 : 0);
      return;
    }

    let resizeObserver: ResizeObserver | undefined;
    const handleResize = () => ScrollTrigger.refresh();
    const context = gsap.context(() => {
      const getTravel = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      const getScrollDistance = () => Math.max(window.innerHeight * 1.65, getTravel() * 1.25);

      gsap.set(track, { x: 0 });

        gsap.to(track, {
          x: () => -getTravel(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top 5.5rem',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (trigger) => {
            const nextProgress = trigger.progress;
            setActiveIndex(
              Math.min(
                lifecycleStages.length - 1,
                Math.round(nextProgress * (lifecycleStages.length - 1)),
              ),
            );
          },
        },
      });

      resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(viewport);
      resizeObserver.observe(track);
      window.addEventListener('resize', handleResize);
    }, section);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      context.revert();
    };
  }, []);

  const activeStage = lifecycleStages[activeIndex]!;

  return (
    <section ref={sectionRef} id="platform" className="relative overflow-hidden border-t border-border-subtle bg-bg-app py-24 sm:py-32">
      <div className="mx-auto max-w-[92rem] px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="font-brand text-xs uppercase tracking-[0.34em] text-brand-accent/80">The GRC lifecycle</p>
          <h2 className="mt-5 max-w-2xl font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
            Compliance isn&apos;t a checklist. It&apos;s a lifecycle.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
            Every requirement connects to a control. Every control produces evidence. Every audit traces back to what actually happened.
          </p>
        </div>

        <div
          ref={pinRef}
          className="mt-14 md:flex md:h-[min(54rem,calc(100svh-6rem))] md:min-h-[42rem] md:flex-col"
        >
          <div className="flex shrink-0 items-center justify-between gap-6 border-b border-border-subtle py-4">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">The GRC lifecycle</p>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeStage.number}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex shrink-0 items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em]"
              >
                <span className="font-brand text-primary">
                  {String(activeIndex + 1).padStart(2, '0')} / 06
                </span>
                <span className="text-text-primary">{activeStage.title}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex min-h-0 flex-1 items-center">
            <div ref={viewportRef} className="w-full overflow-visible md:overflow-hidden">
              <div ref={trackRef} className="flex flex-col gap-4 px-0 md:w-max md:flex-row md:gap-6 md:pr-[18vw]">
                {lifecycleStages.map((stage, index) => {
                  const Icon = stage.icon;
                  const isActive = index === activeIndex;

                  return (
                    <article
                      key={stage.number}
                      className={`group relative flex w-[calc(100vw-3rem)] shrink-0 flex-col border p-5 transition-[background-color,border-color,opacity,transform,box-shadow] duration-500 sm:w-[min(34rem,calc(100vw-5rem))] md:min-h-[34rem] md:w-[min(48rem,60vw)] md:p-8 ${
                        isActive
                          ? 'border-primary/60 bg-bg-elevated shadow-[0_0_60px_rgba(59,130,246,0.06)] md:scale-[1.015]'
                          : 'border-border-subtle bg-bg-card/70 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="flex items-center gap-3">
                          <span className={`font-brand text-xs tracking-[0.2em] ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                            {stage.number}
                          </span>
                          <span className="h-px w-8 bg-border-strong" />
                          <span className="text-xs uppercase tracking-[0.24em] text-text-muted">{stage.title}</span>
                        </div>
                        <Icon className={`size-5 ${isActive ? 'text-primary' : 'text-text-muted'}`} strokeWidth={1.6} />
                      </div>

                      <div className="mt-12 max-w-[30rem]">
                        <p className="text-sm leading-6 text-text-secondary">{stage.summary}</p>
                        <div className="mt-7 border-t border-border-subtle pt-5">
                          <div className="text-xs uppercase tracking-[0.2em] text-text-muted">{stage.record}</div>
                          <h3 className="mt-3 font-heading text-2xl tracking-[-0.03em] text-text-primary sm:text-3xl">{stage.recordTitle}</h3>
                        </div>
                      </div>

                      <div className={`mt-auto grid gap-x-6 gap-y-4 border-t border-border-subtle pt-5 sm:grid-cols-2 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                        {stage.details.map((detail) => (
                          <div key={detail.label} className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="text-text-muted">{detail.label}</span>
                            <span className={detail.tone ? toneClasses[detail.tone] : 'text-text-primary'}>{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-3 border-t border-border-subtle py-5 text-[0.65rem] uppercase tracking-[0.16em] text-text-muted sm:grid-cols-6 sm:gap-4">
            {lifecycleStages.map((stage, index) => (
              <div key={stage.number} className={index === activeIndex ? 'text-text-primary' : undefined}>
                <span className="font-brand">{stage.number}</span>
                <span className="ml-2 hidden sm:inline">{stage.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
