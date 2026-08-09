import { BuildingOffice2Icon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

import { SectionHeader, SectionShell, Surface } from './shared';

const principles = [
  {
    icon: UserGroupIcon,
    title: 'Membership-scoped ownership',
    detail: 'Tenant work is assigned to memberships, not raw users, so every action stays tied to organization context.',
  },
  {
    icon: BuildingOffice2Icon,
    title: 'Shared database, shared schema',
    detail: 'Organizations stay isolated through organizationId and backend validation rather than separate infrastructure.',
  },
  {
    icon: LockClosedIcon,
    title: 'Same-tenant integrity',
    detail: 'Important relationships are validated at the application layer and protected by database constraints where practical.',
  },
];

export function EnterpriseSection() {
  return (
    <SectionShell>
      <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
        <SectionHeader
          eyebrow="Enterprise architecture"
          title="Built for multi-tenant governance without infrastructure sprawl"
          description="RiskSphere uses one PostgreSQL database, one shared schema, and strict tenant-aware application rules to keep the platform simple and scalable."
        />
        <Surface className="grid gap-4 p-5 sm:p-6">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.title} className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-text-primary">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{principle.detail}</p>
                </div>
              </div>
            );
          })}
        </Surface>
      </div>
    </SectionShell>
  );
}
