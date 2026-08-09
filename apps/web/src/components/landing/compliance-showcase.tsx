import { ClipboardDocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

import { landingRequirements } from '@/mocks/landing';
import { SectionHeader, SectionShell, StatusPill, Surface } from './shared';

const complianceTone = {
  Implemented: 'success',
  'In progress': 'primary',
  'Partially covered': 'warning',
} as const;

export function ComplianceShowcaseSection() {
  return (
    <SectionShell>
      <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
        <SectionHeader
          eyebrow="Compliance management"
          title="Framework requirements with hierarchy and coverage"
          description="Frameworks and requirements stay structured so control coverage can be understood at a glance and traced back to evidence."
        />
        <Surface className="p-5 sm:p-6">
          <div className="grid gap-4">
            {landingRequirements.map((requirement, index) => (
              <div key={requirement.id} className="rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      {index === 0 ? (
                        <ClipboardDocumentCheckIcon className="size-4 text-brand-accent" />
                      ) : (
                        <ShieldCheckIcon className="size-4 text-success" />
                      )}
                      {requirement.framework}
                    </div>
                    <h3 className="mt-2 font-heading text-lg text-text-primary">{requirement.requirement}</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      {requirement.coverage} mapped, {requirement.evidence} evidence, {requirement.mappedControls}{' '}
                      control links.
                    </p>
                  </div>
                  <StatusPill tone={complianceTone[requirement.state as keyof typeof complianceTone] ?? 'neutral'}>
                    {requirement.state}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </SectionShell>
  );
}
