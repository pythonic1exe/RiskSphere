'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  Paperclip,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';

type PreviewTone = 'danger' | 'success' | 'primary' | 'muted';

type Capability = {
  number: string;
  title: string;
  description: string;
  icon: typeof TriangleAlert;
  preview: {
    eyebrow: string;
    title: string;
    details: Array<{ label: string; value: string; tone?: PreviewTone }>;
  };
};

const capabilities: Capability[] = [
  {
    number: '01',
    title: 'Risk Management',
    description: 'Identify, assess and track organizational exposure.',
    icon: TriangleAlert,
    preview: {
      eyebrow: 'Risk record',
      title: 'RISK-104 · Unauthorized privileged access',
      details: [
        { label: 'Exposure', value: 'HIGH', tone: 'danger' },
        { label: 'Owner', value: 'Infrastructure Team' },
        { label: 'Linked controls', value: '3', tone: 'primary' },
      ],
    },
  },
  {
    number: '02',
    title: 'Requirements & Frameworks',
    description: 'Translate obligations into actionable controls.',
    icon: BookOpenCheck,
    preview: {
      eyebrow: 'Requirement map',
      title: 'ISO 27001 · A.5.18 · Access Rights',
      details: [
        { label: 'Mapped controls', value: '3', tone: 'primary' },
        { label: 'Status', value: 'Mapped', tone: 'success' },
        { label: 'Framework', value: 'ISO 27001' },
      ],
    },
  },
  {
    number: '03',
    title: 'Control Management',
    description: 'Assign ownership and turn controls into recurring operations.',
    icon: ShieldCheck,
    preview: {
      eyebrow: 'Control record',
      title: 'CTRL-042 · Quarterly Access Review',
      details: [
        { label: 'Owner', value: 'Sarah Chen' },
        { label: 'Frequency', value: 'Quarterly' },
        { label: 'Status', value: 'Operational', tone: 'success' },
      ],
    },
  },
  {
    number: '04',
    title: 'Evidence',
    description: 'Keep proof attached to the work that produced it.',
    icon: Paperclip,
    preview: {
      eyebrow: 'Evidence item',
      title: 'access-review-q3.pdf',
      details: [
        { label: 'Linked control', value: 'CTRL-042', tone: 'primary' },
        { label: 'Uploaded', value: 'Sep 21' },
        { label: 'Verified', value: 'Yes', tone: 'success' },
      ],
    },
  },
  {
    number: '05',
    title: 'Audit Management',
    description: 'Test controls and trace findings back to actual evidence.',
    icon: ClipboardCheck,
    preview: {
      eyebrow: 'Audit test',
      title: 'AT-031 · Access Review Effectiveness',
      details: [
        { label: 'Evidence tested', value: '4 files' },
        { label: 'Result', value: 'PASSED', tone: 'success' },
        { label: 'Control', value: 'CTRL-042', tone: 'primary' },
      ],
    },
  },
  {
    number: '06',
    title: 'Governance',
    description: 'Manage ownership, roles, notifications and accountability.',
    icon: UsersRound,
    preview: {
      eyebrow: 'Organization context',
      title: 'Acme Corporation',
      details: [
        { label: 'Primary member', value: 'Sarah Chen' },
        { label: 'Controls', value: '89' },
        { label: 'Members', value: '24', tone: 'primary' },
      ],
    },
  },
];

const previewToneClasses: Record<PreviewTone, string> = {
  danger: 'text-danger',
  success: 'text-success',
  primary: 'text-primary',
  muted: 'text-text-muted',
};

function CapabilityPreview({ capability, reducedMotion }: { capability: Capability; reducedMotion: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="border border-border-default bg-bg-card p-5 sm:p-6"
    >
      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-brand-accent/80">{capability.preview.eyebrow}</p>
      <h3 className="mt-4 max-w-sm font-heading text-xl leading-tight tracking-[-0.03em] text-text-primary">
        {capability.preview.title}
      </h3>
      <div className="mt-6 divide-y divide-border-subtle border-y border-border-subtle">
        {capability.preview.details.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="text-text-muted">{detail.label}</span>
            <span className={detail.tone ? previewToneClasses[detail.tone] : 'text-text-primary'}>{detail.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function PlatformCapabilitiesSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const selectedCapability = capabilities[selectedIndex]!;
  const reducedMotion = prefersReducedMotion === true;

  return (
    <section id="capabilities" className="relative bg-bg-base px-6 py-28 sm:px-8 sm:py-36 lg:px-12">
      <div className="mx-auto max-w-[92rem]">
        <div className="max-w-3xl">
          <p className="font-brand text-xs uppercase tracking-[0.34em] text-brand-accent/80">The platform</p>
          <h2 className="mt-5 max-w-2xl font-heading text-4xl leading-[1.03] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
            Everything GRC needs to stay connected.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
            From identifying risk to proving controls, RiskSphere keeps the operating cycle connected in one system.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)] lg:gap-16">
          <div className="border-t border-border-subtle">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              const isSelected = selectedIndex === index;

              return (
                <div key={capability.number}>
                  <motion.button
                    type="button"
                    layout
                    aria-expanded={isSelected}
                    onClick={() => setSelectedIndex(index)}
                    onFocus={() => setSelectedIndex(index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex w-full items-center gap-4 border-b px-0 py-6 text-left outline-none transition-colors duration-300 sm:gap-6 sm:py-7 ${
                      isSelected
                        ? 'border-border-strong bg-bg-card px-4 sm:px-5'
                        : 'border-border-subtle hover:bg-bg-card/70'
                    } focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60`}
                  >
                    <span className={`w-8 shrink-0 font-brand text-xs tracking-[0.18em] transition-colors ${isSelected ? 'text-primary' : 'text-text-muted'}`}>
                      {capability.number}
                    </span>
                    <Icon className={`size-4 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-text-muted'}`} strokeWidth={1.6} />
                    <span className="min-w-0 flex-1">
                      <span className={`block font-heading text-lg tracking-[-0.02em] transition-transform duration-300 sm:text-xl ${isSelected ? 'text-text-primary sm:translate-x-1' : 'text-text-secondary'}`}>
                        {capability.title}
                      </span>
                      <span className="mt-1.5 block max-w-xl text-sm leading-6 text-text-muted">{capability.description}</span>
                    </span>
                    <ArrowRight className={`size-5 shrink-0 transition-all duration-300 ${isSelected ? 'translate-x-1 text-primary' : 'text-text-muted group-hover:translate-x-1 group-hover:text-text-secondary'}`} strokeWidth={1.5} />
                  </motion.button>

                  <div className="md:hidden">
                    <AnimatePresence initial={false} mode="wait">
                      {isSelected && (
                        <CapabilityPreview capability={selectedCapability} reducedMotion={reducedMotion} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="hidden self-start lg:block lg:pt-1" aria-live="polite">
            <AnimatePresence initial={false} mode="wait">
              <CapabilityPreview key={selectedCapability.number} capability={selectedCapability} reducedMotion={reducedMotion} />
            </AnimatePresence>
            <p className="mt-5 max-w-xs text-xs leading-5 text-text-muted">
              A compact view of the records teams connect inside the platform.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
