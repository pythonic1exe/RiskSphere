'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
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
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { auditMemberRoleLabel, auditTypeLabel } from './audit-format';
import {
  addAuditMember,
  addAuditScope,
  cancelAudit,
  createAudit,
  updateAudit,
  createAuditTest,
  type Audit,
  type AuditMemberRole,
  type AuditScopeType,
  type AuditTest,
  type AuditType,
  type OrganizationMember,
} from './audit-api';
import type { AuditTestResult } from './audit-api';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}
function ErrorText({ error }: { error: unknown }) {
  return error ? (
    <p className="text-sm text-danger">
      {error instanceof Error ? error.message : 'Unable to save changes.'}
    </p>
  ) : null;
}
function dateIso(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;
}

export function NewAuditSheet({
  organizationId,
  members,
  open,
  onOpenChange,
  onCreated,
  audit,
}: {
  organizationId: string;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (audit: Audit) => void;
  audit?: Audit;
}) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<AuditType>('INTERNAL');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [lead, setLead] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    if (open) {
      setTitle(audit?.title ?? '');
      setCode(audit?.code ?? '');
      setType(audit?.type ?? 'INTERNAL');
      setDescription(audit?.description ?? '');
      setStart(audit?.plannedStartAt?.slice(0, 10) ?? '');
      setEnd(audit?.plannedEndAt?.slice(0, 10) ?? '');
      setLead(audit?.leadAuditorMembershipId ?? '');
      setError(null);
    }
  }, [audit, open]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const plannedStartAt = dateIso(start);
      const plannedEndAt = dateIso(end);
      const payload = {
        code,
        title,
        type,
        ...(description ? { description } : {}),
        ...(lead ? { leadAuditorMembershipId: lead } : {}),
        ...(plannedStartAt ? { plannedStartAt } : {}),
        ...(plannedEndAt ? { plannedEndAt } : {}),
      };
      const saved = audit
        ? await updateAudit(organizationId, audit.id, payload)
        : await createAudit(organizationId, payload);
      onCreated(saved);
      onOpenChange(false);
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-border-default bg-bg-elevated sm:max-w-[440px]"
      >
        <SheetHeader className="border-b border-border-subtle px-6 py-5">
          <SheetTitle className="text-xl">{audit ? 'Edit Audit' : 'New Audit'}</SheetTitle>
          <p className="text-sm text-text-muted">
            Create the engagement first; scope, team, and tests can follow.
          </p>
        </SheetHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <Field label="Title">
              <Input
                required
                minLength={2}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. 2026 Internal Access Audit"
              />
            </Field>
            <Field label="Code">
              <Input
                required
                minLength={2}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="e.g. AUD-2026-04"
              />
            </Field>
            <Field label="Type">
              <MorphNativeSelect
                value={type}
                onChange={(value) => setType(value as AuditType)}
                className="w-full"
              >
                {Object.entries(auditTypeLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </MorphNativeSelect>
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-28"
              />
            </Field>
            <Field label="Planned start">
              <div className="relative">
                <Input
                  type="date"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-2 size-4 text-text-muted" />
              </div>
            </Field>
            <Field label="Planned end">
              <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
            </Field>
            <Field label="Lead auditor">
              <MorphNativeSelect value={lead} onChange={setLead} className="w-full">
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </MorphNativeSelect>
            </Field>
            <ErrorText error={error} />
          </div>
          <SheetFooter className="border-t border-border-subtle px-6 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : null}Create Audit
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function NewAuditTestSheet({
  organizationId,
  auditId,
  members,
  open,
  onOpenChange,
  onCreated,
  controls,
  requirements,
}: {
  organizationId: string;
  auditId: string;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (test: AuditTest) => void;
  controls: Array<{ id: string; code: string; title: string }>;
  requirements: Array<{ id: string; code: string; title: string }>;
}) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [controlId, setControlId] = useState('');
  const [requirementId, setRequirementId] = useState('');
  const [procedure, setProcedure] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [assignee, setAssignee] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    if (open) {
      setCode('');
      setTitle('');
      setDescription('');
      setControlId('');
      setRequirementId('');
      setProcedure('');
      setExpectedResult('');
      setAssignee('');
      setNotes('');
      setError(null);
    }
  }, [open]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const test = await createAuditTest(organizationId, auditId, {
        code,
        title,
        ...(description ? { description } : {}),
        ...(controlId ? { controlId } : {}),
        ...(requirementId ? { organizationRequirementId: requirementId } : {}),
        procedure,
        expectedResult,
        ...(assignee ? { assignedToMembershipId: assignee } : {}),
        ...(notes ? { notes } : {}),
      });
      onCreated(test);
      onOpenChange(false);
    } catch (caught) {
      setError(caught);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-border-default bg-bg-elevated sm:max-w-[500px]"
      >
        <SheetHeader className="border-b border-border-subtle px-6 py-5">
          <SheetTitle className="text-xl">New Audit Test</SheetTitle>
          <p className="text-sm text-text-muted">
            Define the procedure used to evaluate this engagement.
          </p>
        </SheetHeader>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <Field label="Test code">
              <Input
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="AT-018"
              />
            </Field>
            <Field label="Title">
              <Input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Privileged Access Review"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Field>
            <Field label="Control">
              <MorphNativeSelect value={controlId} onChange={setControlId} className="w-full">
                <option value="">None</option>
                {controls.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} · {item.title}
                  </option>
                ))}
              </MorphNativeSelect>
            </Field>
            <Field label="Requirement">
              <MorphNativeSelect
                value={requirementId}
                onChange={setRequirementId}
                className="w-full"
              >
                <option value="">None</option>
                {requirements.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} · {item.title}
                  </option>
                ))}
              </MorphNativeSelect>
            </Field>
            <Field label="Procedure">
              <Textarea
                required
                value={procedure}
                onChange={(event) => setProcedure(event.target.value)}
                className="min-h-32"
              />
            </Field>
            <Field label="Expected result">
              <Textarea
                required
                value={expectedResult}
                onChange={(event) => setExpectedResult(event.target.value)}
                className="min-h-28"
              />
            </Field>
            <Field label="Assigned auditor">
              <MorphNativeSelect value={assignee} onChange={setAssignee} className="w-full">
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </MorphNativeSelect>
            </Field>
            <Field label="Notes">
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            <ErrorText error={error} />
          </div>
          <SheetFooter className="border-t border-border-subtle px-6 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : null}Create test
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function CompleteAuditTestDialog({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: AuditTestResult) => Promise<void>;
}) {
  const [result, setResult] = useState('PASS');
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onComplete(result as AuditTestResult);
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
          <DialogTitle>Complete Test</DialogTitle>
          <DialogDescription>Choose the result before closing the workpaper.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="Test result">
            <MorphNativeSelect value={result} onChange={setResult} className="w-full">
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
              <option value="EXCEPTION">Exception</option>
              <option value="NOT_APPLICABLE">Not applicable</option>
            </MorphNativeSelect>
          </Field>
          <ErrorText error={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Completing...' : 'Complete Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddMemberDialog({
  organizationId,
  auditId,
  members,
  existingIds,
  open,
  onOpenChange,
  onSaved,
}: {
  organizationId: string;
  auditId: string;
  members: OrganizationMember[];
  existingIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [membershipId, setMembershipId] = useState('');
  const [role, setRole] = useState<AuditMemberRole>('AUDITOR');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addAuditMember(organizationId, auditId, { membershipId, role });
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
          <DialogTitle>Add Audit Member</DialogTitle>
          <DialogDescription>Assign an engagement-specific role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="User">
            <MorphNativeSelect value={membershipId} onChange={setMembershipId} className="w-full">
              <option value="">Select a member</option>
              {members
                .filter((member) => !existingIds.has(member.id))
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </MorphNativeSelect>
          </Field>
          <Field label="Audit role">
            <MorphNativeSelect
              value={role}
              onChange={(value) => setRole(value as AuditMemberRole)}
              className="w-full"
            >
              {Object.entries(auditMemberRoleLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </MorphNativeSelect>
          </Field>
          <ErrorText error={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !membershipId}>
              {saving ? 'Adding...' : 'Add member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddScopeDialog({
  organizationId,
  auditId,
  open,
  onOpenChange,
  onSaved,
  controls,
  requirements,
  frameworks,
}: {
  organizationId: string;
  auditId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  controls: Array<{ id: string; code: string; title: string }>;
  requirements: Array<{ id: string; code: string; title: string }>;
  frameworks: Array<{ id: string; code: string; name: string }>;
}) {
  const [type, setType] = useState<AuditScopeType>('CONTROL');
  const [target, setTarget] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const options =
    type === 'CONTROL' ? controls : type === 'REQUIREMENT' ? requirements : frameworks;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addAuditScope(organizationId, auditId, {
        type,
        ...(type === 'CONTROL'
          ? { controlId: target }
          : type === 'REQUIREMENT'
            ? { organizationRequirementId: target }
            : { organizationFrameworkId: target }),
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Audit Scope</DialogTitle>
          <DialogDescription>
            Choose an existing tenant-scoped framework, requirement, or control.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="Scope type">
            <MorphNativeSelect
              value={type}
              onChange={(value) => {
                setType(value as AuditScopeType);
                setTarget('');
              }}
              className="w-full"
            >
              <option value="FRAMEWORK">Framework</option>
              <option value="REQUIREMENT">Requirement</option>
              <option value="CONTROL">Control</option>
            </MorphNativeSelect>
          </Field>
          <Field label="Target">
            <MorphNativeSelect value={target} onChange={setTarget} className="w-full">
              <option value="">Select a target</option>
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {'name' in item ? `${item.code} · ${item.name}` : `${item.code} · ${item.title}`}
                </option>
              ))}
            </MorphNativeSelect>
          </Field>
          <ErrorText error={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !target}>
              {saving ? 'Adding...' : 'Add scope'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CancelAuditDialog({
  organizationId,
  auditId,
  open,
  onOpenChange,
  onCancelled,
}: {
  organizationId: string;
  auditId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await cancelAudit(organizationId, auditId);
      onCancelled();
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
          <DialogTitle>Cancel Audit?</DialogTitle>
          <DialogDescription>
            This keeps the engagement history available but stops normal lifecycle work.
          </DialogDescription>
        </DialogHeader>
        {error ? <ErrorText error={error} /> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep audit
          </Button>
          <Button variant="destructive" onClick={() => void submit()} disabled={saving}>
            {saving ? 'Cancelling...' : 'Cancel Audit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
