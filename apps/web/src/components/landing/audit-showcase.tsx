import { ClipboardDocumentListIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';

import { landingAudits } from '@/mocks/landing';
import { SectionHeader, SectionShell, StatusPill, Surface } from './shared';

export function AuditShowcaseSection() {
  return (
    <SectionShell>
      <div className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <Surface className="p-5 sm:p-6">
          <div className="grid gap-4">
            {landingAudits.map((audit, index) => (
              <div key={audit.id} className="rounded-2xl border border-border-subtle bg-bg-elevated/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      {index === 0 ? (
                        <ClipboardDocumentListIcon className="size-4 text-brand-accent" />
                      ) : (
                        <MagnifyingGlassCircleIcon className="size-4 text-warning" />
                      )}
                      Audit scope
                    </div>
                    <h3 className="mt-2 font-heading text-xl text-text-primary">{audit.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{audit.scope}</p>
                  </div>
                  <StatusPill tone={index === 0 ? 'primary' : 'warning'}>{audit.status}</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-bg-card p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Tests</div>
                    <div className="mt-1 text-sm text-text-primary">{audit.testsComplete}</div>
                  </div>
                  <div className="rounded-xl bg-bg-card p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Evidence</div>
                    <div className="mt-1 text-sm text-text-primary">{audit.evidenceRequested}</div>
                  </div>
                  <div className="rounded-xl bg-bg-card p-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-text-muted">Findings</div>
                    <div className="mt-1 text-sm text-text-primary">{audit.openFindings}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <SectionHeader
          eyebrow="Audit management"
          title="Audit programs, tests, and findings in one traceable chain"
          description="Audits work from scoped programs and tests, then feed findings and remediation without breaking the history of what was reviewed."
        />
      </div>
    </SectionShell>
  );
}
