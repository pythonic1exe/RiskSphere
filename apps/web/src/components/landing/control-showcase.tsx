import { CheckCircleIcon, FunnelIcon, ServerStackIcon } from '@heroicons/react/24/outline';

import { landingControls } from '@/mocks/landing';
import { SectionHeader, SectionShell, StatusPill, Surface } from './shared';

const toneByEffectiveness = {
  Effective: 'success',
  'Needs Review': 'warning',
  'At Risk': 'danger',
} as const;

export function ControlShowcaseSection() {
  return (
    <SectionShell>
      <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <Surface className="p-5 sm:p-6">
          <div className="grid gap-4">
            {landingControls.map((control, index) => (
              <div key={control.id} className="rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      {index === 0 ? (
                        <CheckCircleIcon className="size-4 text-success" />
                      ) : index === 1 ? (
                        <FunnelIcon className="size-4 text-brand-accent" />
                      ) : (
                        <ServerStackIcon className="size-4 text-warning" />
                      )}
                      {control.controlType} control
                    </div>
                    <h3 className="mt-2 font-heading text-xl text-text-primary">{control.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      Owned by {control.owner}, recurring {control.frequency.toLowerCase()} with evidence
                      tracked on every execution.
                    </p>
                  </div>
                  <StatusPill tone={toneByEffectiveness[control.effectiveness]}>
                    {control.effectiveness}
                  </StatusPill>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-bg-card p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Next</div>
                    <div className="mt-1 text-sm text-text-primary">{control.nextExecution}</div>
                  </div>
                  <div className="rounded-xl bg-bg-card p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Risk links</div>
                    <div className="mt-1 text-sm text-text-primary">{control.mappedRisks}</div>
                  </div>
                  <div className="rounded-xl bg-bg-card p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Requirements</div>
                    <div className="mt-1 text-sm text-text-primary">{control.mappedRequirements}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <SectionHeader
          eyebrow="Control management"
          title="Reusable controls mapped to risks and obligations"
          description="Controls are not one-off tasks. They become durable governance assets with schedules, mappings, and evidence expectations."
        />
      </div>
    </SectionShell>
  );
}
