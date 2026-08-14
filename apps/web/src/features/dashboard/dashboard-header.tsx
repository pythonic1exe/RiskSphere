"use client"

import { Bell, Search, UserRound } from "lucide-react"
import type { ReactNode } from "react"

export function DashboardHeader({ organizationName, userEmail, title = "Dashboard", description, headerActions }: { organizationName: string; userEmail?: string; title?: string; description?: string; headerActions?: ReactNode }) {
  const firstName = userEmail?.split("@")[0]?.split(/[._-]/)[0] || "Usman"
  const initials = firstName.slice(0, 2).toUpperCase()

  return (
    <header className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-text-muted">Good morning, {firstName}</p>
        <h1 className="mt-2 font-heading text-4xl font-medium tracking-[-0.065em] text-text-primary sm:text-[2.85rem]">{title}</h1>
        <p className="mt-3 text-sm text-text-muted">{description ?? `Your organization's risk, compliance and assurance overview across ${organizationName}.`}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {headerActions}
        <button type="button" aria-label="Search workspace" className="flex size-10 items-center justify-center rounded-xl border border-border-default/70 bg-bg-card/70 text-text-muted transition-colors hover:border-border-strong hover:bg-bg-card hover:text-text-primary"><Search className="size-[17px]" /></button>
        <button type="button" aria-label="View notifications" className="relative flex size-10 items-center justify-center rounded-xl border border-border-default/70 bg-bg-card/70 text-text-muted transition-colors hover:border-border-strong hover:bg-bg-card hover:text-text-primary"><Bell className="size-[17px]" /><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-brand-accent" /></button>
        <button type="button" aria-label={`Open ${firstName} profile`} className="flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-primary-muted text-xs font-semibold text-primary"><span className="sr-only">Profile for </span>{initials || <UserRound className="size-4" />}</button>
      </div>
    </header>
  )
}
