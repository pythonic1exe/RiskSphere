import type { Metadata } from "next"

import { LoginPageShell } from "@/features/auth/login-page-shell"

export const metadata: Metadata = { title: "Log in | RiskSphere", description: "Log in to your RiskSphere workspace." }

export default function LoginPage({ searchParams }: { searchParams?: { next?: string | string[] } }) {
  const nextPath = Array.isArray(searchParams?.next) ? searchParams.next[0] : searchParams?.next
  return typeof nextPath === "string" ? <LoginPageShell nextPath={nextPath} /> : <LoginPageShell />
}
