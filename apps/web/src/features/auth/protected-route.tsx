"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "./auth-provider"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isRestoring } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isRestoring && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [isRestoring, pathname, router, user])

  if (isRestoring || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-base text-sm text-text-muted">Restoring your session...</div>
  }

  return children
}
