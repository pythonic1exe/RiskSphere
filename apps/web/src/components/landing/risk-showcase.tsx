import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

import { landingRisks } from '@/mocks/landing';
import { SectionHeader, SectionShell, StatusPill, Surface } from './shared';

export function RiskShowcaseSection() {
  return (
    <SectionShell id="solutions">
      <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
        <SectionHeader
          eyebrow="Risk management"
          title="Risk registers that stay connected to real execution"
          description="Each risk carries ownership, severity, controls, and evolving assessment history so leadership sees the full picture."
        />
        <Surface className="p-5 sm:p-6">
          <div className="grid gap-4">
            {landingRisks.map((risk, index) => (
              <div
                key={risk.id}
                className="rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4 transition-colors hover:bg-bg-hover/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      {index === 0 ? (
                        <ExclamationTriangleIcon className="size-4 text-risk-critical" />
                      ) : (
                        <ShieldExclamationIcon className="size-4 text-brand-accent" />
                      )}
                      {risk.category}
                    </div>
                    <h3 className="mt-2 font-heading text-xl text-text-primary">{risk.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      Owner {risk.owner} monitors {risk.mappedControls} mapped controls with recurring
                      evidence expectations.
                    </p>
                  </div>
                  <div className="grid gap-2 text-right">
                    <StatusPill tone={index === 0 ? 'danger' : index === 1 ? 'warning' : 'primary'}>
                      {risk.inherentRisk}
                    </StatusPill>
                    <span className="text-sm text-text-muted">Residual {risk.residualRisk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </SectionShell>
  );
}
