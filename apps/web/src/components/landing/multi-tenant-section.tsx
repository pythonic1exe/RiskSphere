'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Building2,
  Check,
  ChevronDown,
  History,
  KeyRound,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Tenant = {
  id: string;
  name: string;
  wordmark: string;
  metrics: Array<{ label: string; value: string }>;
  frameworks: string[];
  activeAudits: number;
  members: Array<{ name: string; role: string; initials: string }>;
};

const tenants: Tenant[] = [
  {
    id: 'acme',
    name: 'Acme Corporation',
    wordmark: 'ACME',
    metrics: [
      { label: 'Members', value: '24' },
      { label: 'Risks', value: '32' },
      { label: 'Controls', value: '89' },
      { label: 'Evidence', value: '146' },
    ],
    frameworks: ['ISO 27001', 'SOC 2'],
    activeAudits: 3,
    members: [
      { name: 'Sarah Chen', role: 'Compliance Manager', initials: 'SC' },
      { name: 'Ahmed Khan', role: 'Control Owner', initials: 'AK' },
      { name: 'Maya Patel', role: 'Risk Owner', initials: 'MP' },
    ],
  },
  {
    id: 'northstar',
    name: 'Northstar Labs',
    wordmark: 'NORTHSTAR',
    metrics: [
      { label: 'Members', value: '12' },
      { label: 'Risks', value: '18' },
      { label: 'Controls', value: '54' },
      { label: 'Evidence', value: '82' },
    ],
    frameworks: ['SOC 2'],
    activeAudits: 2,
    members: [
      { name: 'Daniel Brooks', role: 'Compliance Manager', initials: 'DB' },
      { name: 'Sophia Lee', role: 'Control Owner', initials: 'SL' },
      { name: 'Ali Hassan', role: 'Auditor', initials: 'AH' },
    ],
  },
  {
    id: 'vertex',
    name: 'Vertex Financial',
    wordmark: 'VERTEX',
    metrics: [
      { label: 'Members', value: '31' },
      { label: 'Risks', value: '41' },
      { label: 'Controls', value: '103' },
      { label: 'Evidence', value: '211' },
    ],
    frameworks: ['ISO 27001', 'NIST CSF'],
    activeAudits: 4,
    members: [
      { name: 'Maya Patel', role: 'Risk Manager', initials: 'MP' },
      { name: 'Omar Shah', role: 'Control Owner', initials: 'OS' },
      { name: 'James Wilson', role: 'Auditor', initials: 'JW' },
    ],
  },
];

const defaultTenant = tenants[0]!;

const accessPrinciples = [
  {
    title: 'Tenant isolation',
    description: 'Organization-owned records remain scoped to their workspace.',
    icon: Building2,
  },
  {
    title: 'Role-based access',
    description: 'Permissions determine what users can view and manage.',
    icon: KeyRound,
  },
  {
    title: 'Traceable activity',
    description: 'Important governance actions remain accountable and auditable.',
    icon: History,
  },
];

export function MultiTenantSection() {
  const [tenantId, setTenantId] = useState('acme');
  const prefersReducedMotion = useReducedMotion();
  const tenant = tenants.find((item) => item.id === tenantId) ?? defaultTenant;
  const transition = {
    duration: prefersReducedMotion ? 0 : 0.32,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <section id="tenancy" className="relative overflow-hidden bg-bg-base px-6 py-32 sm:px-8 sm:py-40 lg:px-12">
      <div className="mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-brand text-xs uppercase tracking-[0.34em] text-brand-accent/80">Multi-tenant by design</p>
          <h2 className="mt-5 font-heading text-4xl leading-[1.04] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
            One platform. A workspace for every organization.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
            Users, risks, controls, evidence and audits stay scoped to the organization they belong to.
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-[66rem] sm:mt-24">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={tenant.id}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-10 overflow-hidden text-center font-heading text-[clamp(5rem,20vw,16rem)] font-semibold leading-none tracking-[-0.09em] text-text-primary/[0.025]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transition}
            >
              {tenant.wordmark}
            </motion.div>
          </AnimatePresence>

          <div className="relative overflow-hidden rounded-[18px] border border-border-default bg-bg-card shadow-[0_28px_90px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-6 border-b border-border-subtle px-6 py-6 sm:px-9 sm:py-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">Organization context</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
                  The same RiskSphere workspace, scoped to the organization your team is operating in.
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  aria-label={`Switch organization. Current organization: ${tenant.name}`}
                  className="flex min-h-12 w-full items-center justify-between gap-5 rounded-xl border border-border-strong bg-bg-elevated px-4 text-left transition-colors hover:border-primary/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:min-w-[19rem] sm:w-auto"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
                      <Building2 className="size-4" strokeWidth={1.7} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-text-muted">Organization</span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-text-primary">{tenant.name}</span>
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-text-muted" strokeWidth={1.7} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[min(19rem,calc(100vw-3rem))] rounded-xl border border-border-default bg-bg-elevated p-2 text-text-primary shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <DropdownMenuLabel className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">
                    Switch organization
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={tenant.id} onValueChange={setTenantId}>
                    {tenants.map((item) => (
                      <DropdownMenuRadioItem
                        key={item.id}
                        value={item.id}
                        className="rounded-lg px-3 py-2.5 text-sm text-text-secondary data-[highlighted]:bg-bg-hover data-[highlighted]:text-text-primary"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-bg-card text-[0.6rem] font-medium text-text-muted">
                            {item.wordmark.slice(0, 2)}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={tenant.id}
                aria-live="polite"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                transition={transition}
              >
                <div className="grid grid-cols-2 border-b border-border-subtle sm:grid-cols-4">
                  {tenant.metrics.map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`px-6 py-7 sm:px-8 sm:py-8 ${index > 0 ? 'border-l border-border-subtle' : ''} ${index > 1 ? 'border-t border-border-subtle sm:border-t-0' : ''}`}
                    >
                      <motion.div layout className="font-heading text-3xl tracking-[-0.04em] text-text-primary sm:text-4xl">
                        {metric.value}
                      </motion.div>
                      <div className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">{metric.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-10 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">Frameworks</p>
                      <p className="text-xs text-text-muted">{tenant.activeAudits} active audits</p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-primary">
                      {tenant.frameworks.map((framework) => (
                        <span key={framework} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary" />
                          {framework}
                        </span>
                      ))}
                    </div>
                    <p className="mt-9 max-w-xs text-sm leading-6 text-text-muted">
                      Governance records, controls and evidence remain visible inside this organization context.
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">Members</p>
                    <div className="mt-3 divide-y divide-border-subtle border-y border-border-subtle">
                      {tenant.members.map((member) => (
                        <motion.div layout key={member.name} className="flex items-center justify-between gap-4 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg-elevated text-[0.65rem] font-medium text-text-secondary">
                              {member.initials}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-text-primary">{member.name}</span>
                              <span className="mt-0.5 block truncate text-xs text-text-muted">{member.role}</span>
                            </span>
                          </div>
                          <span className="hidden shrink-0 items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-text-muted sm:flex">
                            <Check className="size-3 text-success" strokeWidth={2} />
                            Active
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-8 text-center text-sm tracking-wide text-text-muted">
            Context changes. <span className="text-text-primary">Boundaries don&apos;t.</span>
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-[66rem] border-t border-border-subtle sm:mt-24 md:grid-cols-3">
          {accessPrinciples.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <div key={principle.title} className={`py-7 sm:py-8 md:px-8 ${index > 0 ? 'border-t border-border-subtle md:border-l md:border-t-0' : 'md:pr-8'}`}>
                <Icon className="size-5 text-primary" strokeWidth={1.6} />
                <h3 className="mt-5 text-xs uppercase tracking-[0.2em] text-text-primary">{principle.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-text-muted">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
