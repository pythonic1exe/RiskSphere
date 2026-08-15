"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { DashboardHome } from "@/features/dashboard/dashboard-home"
import { DashboardShell } from "@/features/dashboard/dashboard-shell"

import { getAuthenticatedDestination, getMyOrganizations, type OrganizationSummary } from "./auth-client"
import { useAuth } from "./auth-provider"

export function WorkspaceHome() {
  const router = useRouter()
  const { user } = useAuth()
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

  return <DashboardShell organizationName={organization.name} {...(user?.email ? { userEmail: user.email } : {})}><DashboardHome organizationId={organization.id} /></DashboardShell>
}
