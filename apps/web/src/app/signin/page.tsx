import type { Metadata } from "next"

import { LoginPageShell } from "@/features/auth/login-page-shell"

export const metadata: Metadata = {
  title: "Sign in | RiskSphere",
  description: "Sign in to your RiskSphere workspace.",
}

export default function SignInPage() {
  return <LoginPageShell />
}
