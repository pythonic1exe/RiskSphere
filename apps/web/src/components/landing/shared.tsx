import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className="font-brand text-xs uppercase tracking-[0.32em] text-brand-accent/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-3xl leading-tight text-text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-text-secondary">{description}</p>
    </div>
  );
}

export function SectionShell({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('relative mx-auto max-w-[92rem] px-6 py-24 sm:px-8 lg:px-12', className)}>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card/80 p-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-text-muted">{label}</div>
      <div className="mt-3 font-heading text-3xl text-text-primary">{value}</div>
      <div className="mt-2 text-sm text-text-muted">{detail}</div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary' | 'accent';
}) {
  const tones = {
    neutral: 'bg-bg-hover text-text-secondary border-border-subtle',
    success: 'bg-success-muted text-success border-transparent',
    warning: 'bg-warning-muted text-warning border-transparent',
    danger: 'bg-danger-muted text-danger border-transparent',
    primary: 'bg-primary-muted text-primary border-transparent',
    accent: 'bg-accent-muted text-brand-accent border-transparent',
  } as const;

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function Surface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[24px] border border-border-default bg-bg-card/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-sm', className)}>
      {children}
    </div>
  );
}
