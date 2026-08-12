"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import { getAuthenticatedDestination, getMyOrganizations, type OrganizationSummary } from "./auth-client"
import { useAuth } from "./auth-provider"

export function WorkspaceHome() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [organization, setOrganization] = useState<OrganizationSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrganizations().then((organizations) => {
      const destination = getAuthenticatedDestination(organizations)
      if (destination !== "/workspace") {
        router.replace(destination)
        return
      }
      setOrganization(organizations.find((item) => item.status === "ACTIVE" && item.onboarding?.status === "COMPLETED") ?? null)
    }).finally(() => setLoading(false))
  }, [router])

  if (loading || !organization) return <div className="flex min-h-screen items-center justify-center bg-bg-base text-sm text-text-muted">Loading your workspace...</div>

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <header className="border-b border-border-subtle px-6 py-5 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[92rem] items-center justify-between"><div className="font-brand text-sm tracking-[0.22em]">RISK<span className="text-primary">SPHERE</span></div><Button variant="ghost" size="sm" onClick={() => logout().then(() => router.replace("/login"))}>Log out</Button></div></header>
      <section className="mx-auto max-w-[92rem] px-6 py-16 sm:px-8 lg:px-12"><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Workspace</p><h1 className="mt-4 font-heading text-4xl tracking-tight sm:text-5xl">Welcome back, {user?.email}</h1><p className="mt-4 text-text-muted">{organization.name} is ready for your GRC program.</p><div className="mt-10 rounded-2xl border border-border-default bg-bg-app p-6"><p className="text-sm text-text-muted">Your RiskSphere workspace is ready. Product modules will appear here as they are enabled.</p></div></section>
    </main>
  )
}
