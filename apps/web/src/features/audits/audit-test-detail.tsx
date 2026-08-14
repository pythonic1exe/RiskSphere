'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MorphNativeSelect } from '@/components/ui/morph-select';
import { Textarea } from '@/components/ui/textarea';
import { getMyOrganizations } from '@/features/auth/auth-client';
import { getEvidence, getEvidenceVersions } from '@/features/evidence/evidence-api';
import { DashboardShell } from '@/features/dashboard/dashboard-shell';
import {
  completeAuditTest,
  blockAuditTest,
  createAuditTestObservation,
  getAudit,
  getAuditTest,
  getAuditTestEvidence,
  getAuditTestObservations,
  removeAuditTestObservation,
  startAuditTest,
  submitAuditTestForReview,
  unblockAuditTest,
  unlinkAuditTestEvidence,
  type AuditObservation,
} from './audit-api';
import {
  formatAuditDate,
  humanizePerson,
  personEmail,
  resultTone,
  statusTone,
  testResultLabel,
  testStatusLabel,
} from './audit-format';
import { CompleteAuditTestDialog } from './audit-sheets';
import { PromoteFindingSheet } from '@/features/findings/finding-ui';

function useOrganization() {
  return useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
    select: (items) =>
      items.find((item) => item.status === 'ACTIVE' && item.onboarding?.status === 'COMPLETED') ??
      null,
  });
}
function EvidenceLinkDialog({
  organizationId,
  testId,
  open,
  onOpenChange,
  onSaved,
}: {
  organizationId: string;
  testId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [search, setSearch] = useState('');
  const [evidenceId, setEvidenceId] = useState('');
  const [versionId, setVersionId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const evidenceQuery = useQuery({
    queryKey: ['audit-evidence-search', organizationId, search],
    queryFn: () => getEvidence(organizationId, { search, page: 1, pageSize: 20, status: 'ALL' }),
    enabled: open,
  });
  const versionsQuery = useQuery({
    queryKey: ['evidence-versions', organizationId, evidenceId],
    queryFn: () => getEvidenceVersions(organizationId, evidenceId),
    enabled: Boolean(open && evidenceId),
  });
  const versions = versionsQuery.data?.data ?? [];
  async function submit() {
    if (!evidenceId || !versionId) return;
    setSaving(true);
    setError(null);
    try {
      const { linkAuditTestEvidence } = await import('./audit-api');
      await linkAuditTestEvidence(organizationId, testId, {
        evidenceId,
        evidenceVersionId: versionId,
      });
      onSaved();
      onOpenChange(false);
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Link Evidence</DialogTitle>
          <DialogDescription>
            Select the exact immutable EvidenceVersion reviewed by this test.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search evidence..."
          />
          {evidenceQuery.data?.data?.length ? (
            <MorphNativeSelect
              value={evidenceId}
              onChange={(value) => {
                setEvidenceId(value);
                setVersionId('');
              }}
              className="w-full"
            >
              <option value="">Select evidence</option>
              {evidenceQuery.data.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </MorphNativeSelect>
          ) : (
            <p className="py-3 text-sm text-text-muted">No evidence found.</p>
          )}
          {evidenceId ? (
            <MorphNativeSelect value={versionId} onChange={setVersionId} className="w-full">
              <option value="">Select version</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  v{version.versionNumber} · {formatAuditDate(version.createdAt)} ·{' '}
                  {version.fileName ?? version.externalUrl ?? 'Artifact'}
                </option>
              ))}
            </MorphNativeSelect>
          ) : null}
          {error ? (
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : 'Unable to link evidence.'}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving || !evidenceId || !versionId}>
            {saving ? 'Linking...' : 'Link Evidence'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function ObservationDialog({
  organizationId,
  testId,
  open,
  onOpenChange,
  onSaved,
}: {
  organizationId: string;
  testId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await createAuditTestObservation(organizationId, testId, content);
      setContent('');
      onSaved();
      onOpenChange(false);
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Observation</DialogTitle>
          <DialogDescription>Record a working note for this test.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-32"
          placeholder="Describe the observation..."
        />
        {error ? (
          <p className="text-sm text-danger">
            {error instanceof Error ? error.message : 'Unable to save observation.'}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving || !content.trim()}>
            {saving ? 'Saving...' : 'Add Observation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function EvidenceReviewed({
  organizationId,
  testId,
  readOnly,
}: {
  organizationId: string;
  testId: string;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const linksQuery = useQuery({
    queryKey: ['audit-test-evidence', organizationId, testId],
    queryFn: () => getAuditTestEvidence(organizationId, testId),
  });
  const links = linksQuery.data?.data ?? [];
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ['audit-test-evidence', organizationId, testId],
    });
    void queryClient.invalidateQueries({ queryKey: ['audit-test', organizationId, testId] });
  };
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl text-text-primary">Evidence reviewed</h2>
          <p className="mt-1 text-sm text-text-muted">
            Immutable versions selected for this workpaper.
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)} disabled={readOnly}>
          <Plus className="size-4" />
          Link Evidence
        </Button>
      </div>
      {links.length ? (
        <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-4 py-4">
              <span>
                <span className="block text-sm font-medium text-text-primary">
                  {link.evidence.title}
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  {link.evidenceVersion.fileName ?? link.evidenceVersion.externalUrl ?? 'Artifact'}{' '}
                  · Version {link.evidenceVersion.versionNumber}
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  Uploaded {formatAuditDate(link.evidenceVersion.createdAt)}
                </span>
              </span>
              {!readOnly ? (
                <button
                  type="button"
                  aria-label="Unlink evidence"
                  className="text-text-muted hover:text-danger"
                  onClick={() => {
                    void unlinkAuditTestEvidence(organizationId, testId, link.id).then(refresh);
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="border-y border-border-subtle/70 py-10 text-sm text-text-muted">
          No evidence has been linked to this test.
        </p>
      )}
      <EvidenceLinkDialog
        organizationId={organizationId}
        testId={testId}
        open={open}
        onOpenChange={setOpen}
        onSaved={refresh}
      />
    </section>
  );
}
function Observations({
  organizationId,
  testId,
  readOnly,
}: {
  organizationId: string;
  testId: string;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['audit-test-observations', organizationId, testId],
    queryFn: () => getAuditTestObservations(organizationId, testId),
  });
  const observations = query.data?.data ?? [];
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ['audit-test-observations', organizationId, testId],
    });
    void queryClient.invalidateQueries({ queryKey: ['audit-test', organizationId, testId] });
  };
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl text-text-primary">Observations</h2>
          <p className="mt-1 text-sm text-text-muted">
            Working notes recorded during testing, not formal findings.
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)} disabled={readOnly}>
          <Plus className="size-4" />
          Add Observation
        </Button>
      </div>
      {observations.length ? (
        <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
          {observations.map((item) => (
            <ObservationRow
              key={item.id}
              item={item}
              organizationId={organizationId}
              testId={testId}
              readOnly={readOnly}
              onSaved={refresh}
            />
          ))}
        </div>
      ) : (
        <p className="border-y border-border-subtle/70 py-10 text-sm text-text-muted">
          No observations recorded.
        </p>
      )}
      <ObservationDialog
        organizationId={organizationId}
        testId={testId}
        open={open}
        onOpenChange={setOpen}
        onSaved={refresh}
      />
    </section>
  );
}
function ObservationRow({
  item,
  organizationId,
  testId,
  readOnly,
  onSaved,
}: {
  item: AuditObservation;
  organizationId: string;
  testId: string;
  readOnly: boolean;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [content, setContent] = useState(item.content);
  const [saving, setSaving] = useState(false);
  async function save() {
    const { updateAuditTestObservation } = await import('./audit-api');
    setSaving(true);
    try {
      await updateAuditTestObservation(organizationId, testId, item.id, content);
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="py-4">
      {editing ? (
        <div className="space-y-3">
          <Textarea value={content} onChange={(event) => setContent(event.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {item.content}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-text-muted">
            <span>
              {humanizePerson(item.createdBy?.name)} · {formatAuditDate(item.createdAt)}
            </span>
            {!readOnly ? (
              <span className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="hover:text-text-primary"
                >
                  Edit
                </button>
                {!item.finding ? <button
                  type="button"
                  onClick={() => setPromoteOpen(true)}
                  className="hover:text-primary"
                >
                  Promote to Finding
                </button> : <a href={`/findings/${item.finding.id}`} className="text-primary hover:underline">{item.finding.findingNumber}</a>}
                <button type="button" onClick={() => { void removeAuditTestObservation(organizationId, testId, item.id).then(onSaved); }} className="hover:text-danger">Remove</button>
              </span>
            ) : item.finding ? <a href={`/findings/${item.finding.id}`} className="text-primary hover:underline">Promoted to {item.finding.findingNumber}</a> : null}
          </div>
        </>
      )}
      <PromoteFindingSheet organizationId={organizationId} auditTestId={testId} observation={item} open={promoteOpen} onOpenChange={setPromoteOpen} onCreated={() => onSaved()} />
    </div>
  );
}

export function AuditTestDetail() {
  const router = useRouter();
  const params = useParams<{ auditId: string; testId: string }>();
  const organizationQuery = useOrganization();
  const organization = organizationQuery.data;
  const queryClient = useQueryClient();
  const [completeOpen, setCompleteOpen] = useState(false);
  const auditQuery = useQuery({
    queryKey: ['audit', organization?.id, params.auditId],
    queryFn: () => getAudit(organization!.id, params.auditId),
    enabled: Boolean(organization && params.auditId),
  });
  const testQuery = useQuery({
    queryKey: ['audit-test', organization?.id, params.testId],
    queryFn: () => getAuditTest(organization!.id, params.testId),
    enabled: Boolean(organization && params.testId),
  });
  if (organizationQuery.isLoading || auditQuery.isLoading || testQuery.isLoading || !organization)
    return (
      <DashboardShell organizationName={organization?.name ?? 'RiskSphere'} title="Audits">
        <div className="py-20 text-center text-sm text-text-muted">Loading test workpaper...</div>
      </DashboardShell>
    );
  const activeOrganization = organization;
  const loadedAudit = auditQuery.data;
  const loadedTest = testQuery.data;
  if (!loadedAudit || !loadedTest)
    return (
      <DashboardShell organizationName={activeOrganization.name} title="Audits">
        <p className="py-20 text-center text-sm text-danger">Unable to load this Audit Test.</p>
      </DashboardShell>
    );
  const audit = loadedAudit;
  const test = loadedTest;
  const readOnly =
    audit.status === 'COMPLETED' || audit.status === 'CANCELLED' || test.status === 'COMPLETED';
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ['audit-test', activeOrganization.id, test.id],
    });
    void queryClient.invalidateQueries({
      queryKey: ['audit-tests', activeOrganization.id, audit.id],
    });
    void queryClient.invalidateQueries({ queryKey: ['audit', activeOrganization.id, audit.id] });
  };
  async function complete(result: Parameters<typeof completeAuditTest>[2]) {
    await completeAuditTest(activeOrganization.id, test.id, result);
    refresh();
  }
  async function lifecycle(action: 'start' | 'review') {
    if (action === 'start') await startAuditTest(activeOrganization.id, test.id);
    else await submitAuditTestForReview(activeOrganization.id, test.id);
    refresh();
  }
  async function toggleBlocked() {
    if (test.status === 'BLOCKED') await unblockAuditTest(activeOrganization.id, test.id);
    else await blockAuditTest(activeOrganization.id, test.id);
    refresh();
  }
  return (
    <DashboardShell organizationName={activeOrganization.name} title="Audits">
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => router.push(`/audits/${audit.id}`)}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          {audit.code}
        </button>
        <header className="space-y-4 border-b border-border-subtle/70 pb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.1em] text-text-muted">
                {audit.code} / {test.code}
              </p>
              <h1 className="mt-2 font-heading text-3xl font-medium text-text-primary sm:text-4xl">
                {test.title}
              </h1>
              <p className="mt-3 text-sm text-text-secondary">
                {test.control?.code
                  ? `${test.control.code} · ${test.control.title}`
                  : test.organizationRequirement?.code
                    ? `${test.organizationRequirement.code} · ${test.organizationRequirement.title}`
                    : 'No linked control or requirement'}
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Assigned to {humanizePerson(test.assignedTo?.name)}
                {personEmail(test.assignedTo?.name) ? (
                  <span className="ml-2 text-xs text-text-disabled">
                    {personEmail(test.assignedTo?.name)}
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {test.status === 'NOT_STARTED' && !readOnly ? (
                <Button onClick={() => void lifecycle('start')}>Start Test</Button>
              ) : null}
              {test.status === 'IN_PROGRESS' && !readOnly ? (
                <Button onClick={() => void lifecycle('review')}>Submit for Review</Button>
              ) : null}
              {test.status === 'READY_FOR_REVIEW' && !readOnly ? (
                <Button onClick={() => setCompleteOpen(true)}>Complete Test</Button>
              ) : null}
              {(test.status === 'IN_PROGRESS' || test.status === 'BLOCKED') && !readOnly ? (
                <Button variant="outline" onClick={() => void toggleBlocked()}>
                  {test.status === 'BLOCKED' ? 'Unblock Test' : 'Block Test'}
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" aria-label="Test actions">
                <MoreHorizontal className="size-5" />
              </Button>
            </div>
          </div>
          <span className={`text-sm ${statusTone(test.status)}`}>
            {testStatusLabel[test.status]}
            {test.result ? ` · ${testResultLabel[test.result]}` : ''}
          </span>
        </header>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
          <div className="space-y-8">
            <section>
              <h2 className="font-heading text-xl text-text-primary">Procedure</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                {test.procedure}
              </p>
            </section>
            <section className="border-t border-border-subtle/70 pt-7">
              <h2 className="font-heading text-xl text-text-primary">Expected result</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                {test.expectedResult}
              </p>
            </section>
            {test.status === 'COMPLETED' ? (
              <section className="border-t border-border-subtle/70 pt-7">
                <h2 className="font-heading text-xl text-text-primary">Result</h2>
                <p className={`mt-3 font-heading text-2xl ${resultTone(test.result)}`}>
                  {test.result ? testResultLabel[test.result] : '—'}
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Completed {formatAuditDate(test.completedAt)}
                  {test.notes ? ` · ${test.notes}` : ''}
                </p>
              </section>
            ) : null}
          </div>
          <aside className="space-y-8">
            <EvidenceReviewed
              organizationId={activeOrganization.id}
              testId={test.id}
              readOnly={readOnly}
            />
            <Observations
              organizationId={activeOrganization.id}
              testId={test.id}
              readOnly={readOnly}
            />
          </aside>
        </div>
        <CompleteAuditTestDialog
          open={completeOpen}
          onOpenChange={setCompleteOpen}
          onComplete={complete}
        />
      </div>
    </DashboardShell>
  );
}
