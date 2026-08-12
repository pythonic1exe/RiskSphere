import type { Metadata } from "next"

import { AuthPageShell } from "@/features/auth/login-page-shell"
import { InvitationAcceptanceForm } from "@/features/auth/invitation-acceptance-form"

export const metadata: Metadata = {
  title: "Accept invitation | RiskSphere",
  description: "Accept your RiskSphere organization invitation.",
}

export default function AcceptInvitationPage({ searchParams }: { searchParams?: { token?: string | string[] } }) {
  const initialToken = Array.isArray(searchParams?.token) ? searchParams.token[0] : searchParams?.token
  return <AuthPageShell><InvitationAcceptanceForm initialToken={typeof initialToken === "string" ? initialToken : ""} /></AuthPageShell>
}
