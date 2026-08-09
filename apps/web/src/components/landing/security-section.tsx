import { ShieldCheckIcon } from '@heroicons/react/24/outline';

import { securityBullets } from '@/mocks/landing';
import { SectionHeader, SectionShell, Surface } from './shared';

export function SecuritySection() {
  return (
    <SectionShell id="security">
      <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
        <SectionHeader
          eyebrow="Security"
          title="Traceability, accountability, and tenant isolation"
          description="Security in RiskSphere is not a separate product layer. It is part of the operating model for every tenant-owned record and workflow."
        />
        <Surface className="p-5 sm:p-6">
          <div className="grid gap-3">
            {securityBullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4">
                <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-success" />
                <p className="text-sm leading-6 text-text-secondary">{bullet}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </SectionShell>
  );
}
