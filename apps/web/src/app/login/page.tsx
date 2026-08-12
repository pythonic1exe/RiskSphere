import type { Metadata } from "next"

import { LoginPageShell } from "@/features/auth/login-page-shell"

export const metadata: Metadata = { title: "Log in | RiskSphere", description: "Log in to your RiskSphere workspace." }

export default function LoginPage() {
  return <LoginPageShell />
}
