import {
  ArrowLongRightIcon,
  CircleStackIcon,
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

import { landingWorkflow } from '@/mocks/landing';
import { SectionHeader, SectionShell, StatusPill, Surface } from './shared';

const icons = [ShieldCheckIcon, WrenchScrewdriverIcon, CircleStackIcon, DocumentCheckIcon, ClipboardDocumentCheckIcon, ArrowLongRightIcon];

export function WorkflowSection() {
  return (
    <SectionShell>
      <SectionHeader
        eyebrow="Lifecycle workflow"
        title="Risk to control to execution to evidence to audit"
        description="The platform is designed to move work forward through a single chain of accountable records instead of duplicated trackers."
        align="center"
      />
      <Surface className="mt-10 overflow-hidden p-5 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-6">
          {landingWorkflow.map((step, index) => {
            const Icon = icons[index] ?? ArrowLongRightIcon;
            return (
              <div
                key={step.label}
                className="relative rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-5 text-brand-accent" />
                  <StatusPill tone={step.status === 'complete' ? 'success' : step.status === 'active' ? 'primary' : 'neutral'}>
                    {step.status}
                  </StatusPill>
                </div>
                <h3 className="mt-4 font-heading text-base text-text-primary">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{step.detail}</p>
              </div>
            );
          })}
        </div>
      </Surface>
    </SectionShell>
  );
}
