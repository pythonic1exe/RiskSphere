'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { RiskSphereBrand } from '@/components/brand/risksphere-brand';

import { goalLabel, goals, roleLabel, roleOptions } from './data';
import { onboardingSteps, stepIndex } from './config';
import { useOnboarding } from './state';
import type { InvitationRole, OnboardingStepId } from './types';

export function OnboardingHeader() {
  return <header className="border-b border-border-subtle px-6 py-5 sm:px-8 lg:px-12"><div className="mx-auto flex w-full max-w-[92rem] items-center justify-between"><RiskSphereBrand /><span className="hidden text-xs text-text-disabled sm:block">Organization setup</span></div></header>;
}

const accountStepper = { id: 'account', stepperLabel: 'Account', stepperDescription: 'Create the organization owner account.' };

function OnboardingProgressView({ currentIndex, activeLabel }: { currentIndex: number; activeLabel: string }) {
  const reduceMotion = useReducedMotion();
  const steps = [accountStepper, ...onboardingSteps];
  return <div className="mx-auto w-full max-w-[92rem] px-6 pt-8 sm:px-8 lg:px-12"><div className="flex items-center justify-between text-xs text-text-muted md:hidden"><span>Step {currentIndex + 1} of {steps.length}</span><span>{activeLabel}</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-border-subtle md:hidden"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }} /></div><div className="hidden rounded-[20px] border border-border-subtle bg-bg-app p-5 pb-8 md:block sm:p-6 sm:pb-9"><div className="grid gap-3 md:grid-cols-7 lg:gap-4">{steps.map((step, index) => { const completed = index < currentIndex; const active = index === currentIndex; return <motion.div key={step.id} {...(reduceMotion ? {} : { whileHover: { y: -2 } })} animate={{ backgroundColor: active ? 'var(--primary-muted)' : completed ? 'rgba(23, 37, 84, 0.42)' : 'var(--bg-card)', borderColor: active ? 'var(--brand-primary)' : completed ? 'rgba(96, 165, 250, 0.42)' : 'var(--border-default)' }} transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }} className="relative flex min-h-[7.1rem] flex-col rounded-lg border px-3 pb-7 pt-4 text-center"><span className={cn('font-heading text-sm font-medium tracking-[-0.02em]', active ? 'text-text-primary' : completed ? 'text-text-secondary' : 'text-text-muted')}>{step.stepperLabel}</span><span className={cn('mt-2 text-[0.68rem] leading-4', active ? 'text-text-secondary' : 'text-text-muted')}>{step.stepperDescription}</span><motion.span animate={{ backgroundColor: active ? 'var(--brand-primary)' : completed ? 'var(--primary-muted)' : 'var(--bg-elevated)', borderColor: active ? 'var(--brand-primary)' : completed ? 'rgba(96, 165, 250, 0.5)' : 'var(--border-strong)', color: active ? 'var(--text-primary)' : completed ? 'var(--primary-hover)' : 'var(--text-disabled)' }} transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }} className="absolute -bottom-3 left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-md border font-sans text-xs font-medium shadow-[0_4px_12px_rgba(7,11,20,0.35)]">{completed ? <Check className="size-3.5" /> : index + 1}</motion.span></motion.div>; })}</div></div></div>;
}

export function OnboardingProgress() {
  const { draft } = useOnboarding();
  const current = stepIndex(draft.currentStep) + 1;
  const activeStep = onboardingSteps[current - 1] ?? onboardingSteps[0]!;
  return <OnboardingProgressView currentIndex={current} activeLabel={activeStep.label} />;
}

export function AccountProgress() {
  return <OnboardingProgressView currentIndex={0} activeLabel="Account" />;
}

export function StepHeader({ step }: { step: (typeof onboardingSteps)[number] }) {
  return <div className="mb-10"><p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-primary">{step.label}{step.optional ? <span className="ml-2 text-text-disabled">Optional</span> : null}</p><h1 className="font-heading text-4xl font-medium leading-[1.03] tracking-[-0.05em] text-text-primary sm:text-5xl lg:text-6xl">{step.title}</h1><p className="mt-5 max-w-xl text-base leading-7 text-text-muted sm:text-lg">{step.description}</p></div>;
}

export function OnboardingFooter({ canContinue, onContinue, onBack, onSkip, final, saving }: { canContinue: boolean; onContinue: () => void; onBack?: () => void; onSkip?: () => void; final?: boolean; saving?: boolean }) {
  return <footer className="mt-12 flex flex-col-reverse gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between"><Button variant="ghost" onClick={onBack} disabled={!onBack || saving} className="text-text-muted hover:text-text-primary sm:mr-auto"><ArrowLeft />Back</Button><div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">{onSkip && <Button variant="ghost" onClick={onSkip} disabled={saving} className="text-text-muted">Skip for now</Button>}<Button onClick={onContinue} disabled={!canContinue || saving} size="lg">{saving ? 'Saving...' : final ? 'Create workspace' : 'Continue'}<ArrowRight /></Button></div></footer>;
}

export function OrganizationStep() {
  const { draft, dispatch } = useOnboarding();
  const nameError = draft.organizationName.trim().length === 0 ? 'Enter your organization name.' : undefined;
  const slugError = draft.workspaceSlug.length > 0 && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.workspaceSlug) ? 'Use lowercase letters, numbers, and hyphens.' : undefined;
  return <div className="space-y-6"><div className="space-y-2"><Label htmlFor="organization-name" className="text-text-secondary">Organization name</Label><Input id="organization-name" value={draft.organizationName} onChange={(event) => dispatch({ type: 'set-organization-name', value: event.target.value })} placeholder="Acme Technologies" aria-invalid={Boolean(nameError && draft.organizationName.length > 0)} className="h-11" />{draft.organizationName.length > 0 && nameError && <p className="text-xs text-danger">{nameError}</p>}</div><div className="space-y-2"><Label htmlFor="workspace-slug" className="text-text-secondary">Workspace URL</Label><div className="flex h-11 items-center rounded-lg border border-input bg-bg-card focus-within:border-border-strong focus-within:ring-3 focus-within:ring-ring/50"><span className="pl-3 text-sm text-text-disabled">risksphere.app/</span><input id="workspace-slug" value={draft.workspaceSlug} onChange={(event) => dispatch({ type: 'set-workspace-slug', value: event.target.value })} placeholder="acme-technologies" aria-invalid={Boolean(slugError)} className="h-full min-w-0 flex-1 bg-transparent px-1 text-sm text-text-primary outline-none placeholder:text-text-disabled" /></div>{slugError ? <p className="text-xs text-danger">{slugError}</p> : <p className="text-xs text-text-disabled">This identifier will be part of your workspace URL.</p>}</div></div>;
}

export function GoalsStep() {
  const { draft, dispatch } = useOnboarding();
  const reduceMotion = useReducedMotion();
  return <div className="grid gap-3 sm:grid-cols-2">{goals.map((goal) => { const selected = draft.goals.includes(goal.id); const GoalIcon = goal.icon; return <motion.button type="button" key={goal.id} aria-pressed={selected} onClick={() => dispatch({ type: 'toggle-goal', goal: goal.id })} {...(reduceMotion ? {} : { whileHover: { y: -2 }, whileTap: { scale: 0.995 } })} animate={{ backgroundColor: selected ? 'rgba(23, 37, 84, 0.5)' : 'var(--bg-card)', borderColor: selected ? 'var(--brand-primary)' : 'var(--border-default)' }} transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }} className="group relative flex min-h-[10rem] flex-col rounded-xl border p-5 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-[10px] border border-border-default bg-bg-elevated text-text-secondary"><GoalIcon className="size-[18px]" strokeWidth={1.8} /></span><motion.span initial={false} animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.85, backgroundColor: selected ? 'var(--brand-primary)' : 'transparent' }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }} className="flex size-6 items-center justify-center rounded-full border border-primary text-text-primary" aria-hidden="true"><Check className="size-3.5" /></motion.span></div><div className="mt-auto pt-8"><span className="block text-[15px] font-semibold text-text-primary">{goal.title}</span><span className="mt-1.5 block text-[13px] leading-5 text-text-muted">{goal.description}</span></div></motion.button>; })}</div>;
}

export function FrameworksStep() {
  const { draft, frameworks, toggleFramework } = useOnboarding(); const [query, setQuery] = useState('');
  const visible = useMemo(() => frameworks.filter((framework) => `${framework.name} ${framework.description ?? ''}`.toLowerCase().includes(query.toLowerCase())), [frameworks, query]);
  return <div><div className="relative mb-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-disabled" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search frameworks" aria-label="Search frameworks" className="h-10 pl-9" /></div><div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-default bg-bg-card">{visible.map((framework) => { const selected = draft.frameworks.includes(framework.id); return <button type="button" key={framework.id} aria-pressed={selected} onClick={() => void toggleFramework(framework.id)} className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"><span className={cn('flex size-5 shrink-0 items-center justify-center rounded border', selected ? 'border-primary bg-primary text-white' : 'border-border-strong text-transparent')}><Check className="size-3" /></span><span className="min-w-0"><span className="block text-sm font-medium text-text-primary">{framework.name}</span><span className="mt-1 block text-xs text-text-muted">{framework.description}</span></span></button>; })}{visible.length === 0 && <p className="px-4 py-8 text-center text-sm text-text-muted">No frameworks match that search.</p>}</div><p className="mt-3 text-xs text-text-disabled">{draft.frameworks.length} selected · You can configure more frameworks later.</p></div>;
}

export function TeamStep() {
  const { draft, dispatch, addInvitation: createInvitation, removeInvitation } = useOnboarding(); const [error, setError] = useState('');
  const addInvitation = async () => { const email = draft.invitationEmail.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid work email address.'); if (draft.invitations.some((invitation) => invitation.email === email)) return setError('That email has already been added.'); try { await createInvitation({ id: `${email}-${Date.now()}`, email, role: draft.invitationRole }); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to create invitation.'); } };
  return <div><div className="grid gap-3 rounded-xl border border-border-default bg-bg-card p-4 sm:grid-cols-[1fr_190px_auto] sm:items-end"><div className="space-y-2"><Label htmlFor="invite-email" className="text-text-secondary">Email address</Label><Input id="invite-email" type="email" value={draft.invitationEmail} onChange={(event) => { dispatch({ type: 'set-invitation-email', value: event.target.value }); if (error) setError(''); }} placeholder="sarah@acme.com" className="h-10" /></div><div className="space-y-2"><Label htmlFor="invite-role" className="text-text-secondary">Role</Label><div className="relative"><select id="invite-role" value={draft.invitationRole} onChange={(event) => dispatch({ type: 'set-invitation-role', value: event.target.value as InvitationRole })} className="h-10 w-full appearance-none rounded-lg border border-input bg-bg-card px-3 pr-8 text-sm text-text-primary outline-none focus:border-border-strong focus:ring-3 focus:ring-ring/50">{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" /></div></div><Button type="button" onClick={() => void addInvitation()} className="h-10"><Plus />Add invitation</Button></div>{error && <p className="mt-2 text-xs text-danger">{error}</p>}<div className="mt-5 space-y-2">{draft.invitations.map((invitation) => <div key={invitation.id} className="flex items-center justify-between border-b border-border-subtle py-3"><div><p className="text-sm text-text-primary">{invitation.email}</p><p className="mt-1 text-xs text-text-muted">{roleLabel(invitation.role)}</p></div><Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${invitation.email}`} onClick={() => void removeInvitation(invitation.id)}><X /></Button></div>)}{draft.invitations.length === 0 && <p className="py-6 text-sm text-text-disabled">No invitations prepared yet. You can invite teammates later.</p>}</div></div>;
}

export function DefaultsStep() {
  const { draft, setDefault } = useOnboarding();
  const fields: Array<{ key: 'timezone' | 'scoring' | 'reviewFrequency'; label: string; options: string[] }> = [{ key: 'timezone', label: 'Timezone', options: ['Asia/Karachi', 'UTC', 'America/New_York', 'Europe/London'] }, { key: 'scoring', label: 'Risk scoring approach', options: ['5×5 Impact × Likelihood', '3×3 Impact × Likelihood'] }, { key: 'reviewFrequency', label: 'Review frequency', options: ['Quarterly', 'Monthly', 'Annually'] }];
  return <div className="space-y-5">{fields.map((field) => <div key={field.key} className="space-y-2"><Label htmlFor={field.key} className="text-text-secondary">{field.label}</Label><div className="relative"><select id={field.key} value={draft.workspaceDefaults[field.key]} onChange={(event) => void setDefault(field.key, event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-bg-card px-3 pr-8 text-sm text-text-primary outline-none focus:border-border-strong focus:ring-3 focus:ring-ring/50">{field.options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" /></div></div>)}</div>;
}

export function ReviewStep({ onEdit }: { onEdit: (step: OnboardingStepId) => void }) {
  const { draft } = useOnboarding();
  const sections = [{ step: 'organization' as const, label: 'Organization', value: <><strong>{draft.organizationName}</strong><span>risksphere.app/{draft.workspaceSlug}</span></> }, { step: 'goals' as const, label: 'GRC focus', value: <>{draft.goals.map(goalLabel).join(' · ') || 'No focus selected'}</> }, { step: 'frameworks' as const, label: 'Frameworks', value: <>{draft.frameworks.length ? `${draft.frameworks.length} selected` : 'Configure later'}</> }, { step: 'team' as const, label: 'Team', value: <>{draft.invitations.length ? `${draft.invitations.length} invitation${draft.invitations.length === 1 ? '' : 's'} prepared` : 'Invite teammates later'}</> }, { step: 'defaults' as const, label: 'Workspace', value: <>{draft.workspaceDefaults.timezone}<span>{draft.workspaceDefaults.scoring} · {draft.workspaceDefaults.reviewFrequency}</span></> }];
  return <div className="divide-y divide-border-subtle">{sections.map((section) => <div key={section.step} className="flex items-start justify-between gap-5 py-5 first:pt-0"><div><p className="text-xs uppercase tracking-[0.12em] text-text-disabled">{section.label}</p><div className="mt-2 flex flex-col gap-1 text-sm text-text-secondary">{section.value}</div></div><Button variant="ghost" size="sm" onClick={() => onEdit(section.step)}>Edit</Button></div>)}</div>;
}

export function CompletionState() {
  const { draft } = useOnboarding();
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center sm:py-16"><div className="mx-auto flex size-12 items-center justify-center rounded-full border border-success/40 bg-success-muted text-success"><CheckCircle2 className="size-5" /></div><h1 className="mt-7 font-heading text-4xl tracking-[-0.05em] text-text-primary">Your workspace is ready</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-muted">{draft.organizationName || 'RiskSphere'} is configured and ready for your GRC program.</p></motion.div>;
}

export function OnboardingContent() {
  const { draft, loading, saving, error, advance, complete, dispatch } = useOnboarding(); const reduceMotion = useReducedMotion(); const current = stepIndex(draft.currentStep); const step = onboardingSteps[current] ?? onboardingSteps[0]!; const [direction, setDirection] = useState(1);
  const canContinue = draft.currentStep === 'organization' ? Boolean(draft.organizationName.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.workspaceSlug)) : draft.currentStep === 'goals' ? draft.goals.length > 0 : true;
  const move = (next: OnboardingStepId) => { setDirection(stepIndex(next) >= current ? 1 : -1); dispatch({ type: 'set-step', step: next }); };
  const next = async () => { if (draft.currentStep === 'review') { await complete(); return; } const nextStep = onboardingSteps[current + 1]; if (nextStep) await advance(nextStep.id); };
  const back = () => { const previous = onboardingSteps[current - 1]; if (previous) move(previous.id); };
  if (loading) return <div className="flex min-h-[70vh] items-center justify-center text-sm text-text-muted">Loading your onboarding workspace...</div>;
  const contentWidth = draft.currentStep === 'goals' || draft.currentStep === 'frameworks' || draft.currentStep === 'team' ? 'max-w-4xl' : 'max-w-3xl';
  return <><OnboardingProgress /><main className="mx-auto w-full max-w-[92rem] px-6 pb-12 pt-14 sm:px-8 sm:pt-20 lg:px-12"><div className={cn('mx-auto w-full', contentWidth)}><StepHeader step={step} />{error ? <p className="mb-5 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger" role="alert">{error}</p> : null}<AnimatePresence mode="wait" initial={false} custom={direction}><motion.div key={step.id} custom={direction} initial={reduceMotion ? false : { opacity: 0, y: direction > 0 ? 8 : -8 }} animate={{ opacity: 1, y: 0 }} {...(reduceMotion ? {} : { exit: { opacity: 0, y: direction > 0 ? -8 : 8 } })} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>{draft.currentStep === 'organization' && <OrganizationStep />}{draft.currentStep === 'goals' && <GoalsStep />}{draft.currentStep === 'frameworks' && <FrameworksStep />}{draft.currentStep === 'team' && <TeamStep />}{draft.currentStep === 'defaults' && <DefaultsStep />}{draft.currentStep === 'review' && <ReviewStep onEdit={move} />}</motion.div></AnimatePresence><OnboardingFooter canContinue={canContinue} onContinue={() => void next()} {...(current > 0 ? { onBack: back } : {})} {...(step.optional ? { onSkip: () => void next() } : {})} final={draft.currentStep === 'review'} saving={saving} /></div></main></>;
}

export function OnboardingShell() {
  return <div className="min-h-screen bg-bg-base text-text-primary"><OnboardingHeader /><OnboardingContent /></div>;
}
