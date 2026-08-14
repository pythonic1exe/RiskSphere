"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { useAuth } from "@/features/auth/auth-provider"

export function DashboardShell({ organizationName, userEmail, title, description, headerActions, children }: { organizationName: string; userEmail?: string; title?: string; description?: string; headerActions?: ReactNode; children: ReactNode }) {
  const router = useRouter()
  const { logout } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  async function handleLogout() {
    await logout()
    router.replace("/login")
  }

  return <div className="min-h-screen bg-bg-base text-text-primary"><DashboardSidebar onLogout={handleLogout} onExpandedChange={setSidebarExpanded} /><main className={`min-w-0 flex-1 p-0 transition-[margin-left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:ml-[88px] lg:p-3 lg:pl-4 ${sidebarExpanded ? "lg:ml-[236px]" : ""}`}><div className="min-h-[calc(100vh-1.5rem)] bg-bg-app px-5 py-8 sm:px-8 sm:py-10 lg:rounded-[22px] lg:px-12 lg:py-12"><div className="mx-auto max-w-[1440px]"><DashboardHeader organizationName={organizationName} {...(userEmail ? { userEmail } : {})} {...(title ? { title } : {})} {...(description ? { description } : {})} {...(headerActions ? { headerActions } : {})} /><div className="mt-10">{children}</div></div></div></main></div>
}
