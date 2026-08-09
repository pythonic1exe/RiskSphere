'use client';

import { motion } from 'motion/react';
import {
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { dashboardMetrics, landingControls, landingRisks } from '@/mocks/landing';
import { SectionHeader, SectionShell } from './shared';

const activity = [
  { time: '09:42', title: 'Evidence submitted', detail: 'privileged-access-review.csv attached to Q3 execution', icon: DocumentCheckIcon },
  { time: '09:18', title: 'Control mapped', detail: 'AC-07 linked to R-104 and 5 requirements', icon: CheckCircleIcon },
  { time: '08:56', title: 'Risk assessment updated', detail: 'Residual exposure moved from High to Medium', icon: ArrowTrendingUpIcon },
];

export function ControlSystemSection() {
  const primaryRisk = landingRisks[0]!;
  const primaryControl = landingControls[0]!;

  return (
    <SectionShell id="solutions" className="pt-10 sm:pt-16">
      <div className="flex flex-col gap-6 border-b border-border-subtle pb-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="THE OPERATING SYSTEM"
          title="A live view of what the organization knows, owns, and can prove"
          description="RiskSphere brings the register, control work, evidence, and audit trail into the same operating context so decisions stay attached to accountable records."
        />
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-text-muted">
          <span className="size-2 rounded-full bg-success" />
          <span>Northstar Health Systems</span>
          <span className="text-border-strong">/</span>
          <span>Q3 2026</span>
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[0.72fr_1.55fr_0.83fr]">
        <aside className="border-y border-border-subtle py-2">
          <div className="px-1 py-3 text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">Workspace records</div>
          <div className="divide-y divide-border-subtle">
            {[
              { label: 'Risk register', value: '18 open', icon: ShieldExclamationIcon, active: true },
              { label: 'Control library', value: '42 active', icon: CheckCircleIcon },
              { label: 'Evidence queue', value: '14 pending', icon: DocumentCheckIcon },
              { label: 'Audit readiness', value: '91%', icon: LockClosedIcon },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`flex items-center justify-between gap-3 px-1 py-4 ${item.active ? 'text-text-primary' : 'text-text-muted'}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`size-4 ${item.active ? 'text-brand-accent' : 'text-text-muted'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-xs tabular-nums">{item.value}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex items-start gap-3 border-t border-border-subtle pt-5 text-xs leading-5 text-text-muted">
            <UserGroupIcon className="mt-0.5 size-4 shrink-0 text-text-secondary" />
            <span>Assignments resolve through tenant memberships, keeping ownership inside the active organization.</span>
          </div>
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="border border-border-default bg-bg-card/70 p-5 sm:p-7"
        >
          <div className="flex flex-col gap-5 border-b border-border-subtle pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">
                <ShieldExclamationIcon className="size-4 text-risk-critical" />
                Active risk record
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-heading text-3xl text-text-primary">R-104</span>
                <span className="text-sm text-text-muted">{primaryRisk.category}</span>
              </div>
              <h3 className="mt-2 font-heading text-xl text-text-primary">{primaryRisk.title}</h3>
            </div>
            <div className="border-l border-border-subtle pl-5 text-sm sm:text-right">
              <div className="text-text-muted">Owner</div>
              <div className="mt-1 text-text-primary">{primaryRisk.owner}</div>
              <div className="mt-4 text-text-muted">Status</div>
              <div className="mt-1 text-warning">{primaryRisk.status}</div>
            </div>
          </div>

          <div className="grid gap-6 py-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Inherent exposure</div>
              <div className="mt-2 font-heading text-2xl text-risk-critical">{primaryRisk.inherentRisk}</div>
              <div className="mt-1 text-sm text-text-secondary">{primaryRisk.likelihood} likelihood · {primaryRisk.impact} impact</div>
            </div>
            <div className="hidden h-px w-16 bg-gradient-to-r from-risk-critical via-brand-accent to-success sm:block" />
            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Residual exposure</div>
              <div className="mt-2 font-heading text-2xl text-warning">{primaryRisk.residualRisk}</div>
              <div className="mt-1 text-sm text-text-secondary">{primaryRisk.mappedControls} mapped controls · recurring review</div>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Control coverage</div>
                <div className="mt-2 text-sm text-text-secondary">{primaryControl.title}</div>
              </div>
              <div className="text-right">
                <div className="font-heading text-2xl text-success">Effective</div>
                <div className="mt-1 text-xs text-text-muted">Next run {primaryControl.nextExecution}</div>
              </div>
            </div>
            <div className="mt-4 h-1 bg-bg-hover">
              <div className="h-full w-[84%] bg-gradient-to-r from-primary to-brand-accent" />
            </div>
          </div>
        </motion.div>

        <div className="border-y border-border-subtle py-2">
          <div className="px-1 py-3 text-[0.65rem] uppercase tracking-[0.24em] text-text-muted">Live activity</div>
          <div className="relative divide-y divide-border-subtle">
            {activity.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className="flex gap-3 py-4"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-brand-accent" />
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-sm text-text-primary">{event.title}</h3>
                      <time className="text-[0.65rem] tabular-nums text-text-muted">{event.time}</time>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-text-muted">{event.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 border-t border-border-subtle pt-5">
            <div className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">Workspace pulse</div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
              {dashboardMetrics.slice(0, 4).map((metric) => (
                <div key={metric.label}>
                  <div className="font-heading text-xl text-text-primary">{metric.value}</div>
                  <div className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-text-muted">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
