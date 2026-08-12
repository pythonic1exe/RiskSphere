"use client"

import { useAuth } from "@/features/auth/auth-provider"

import { AccountProgress, OnboardingHeader, OnboardingShell } from "./components"
import { OnboardingAccountSetup } from "./account-setup"
import { OnboardingProvider } from "./state"

export function OnboardingEntry() {
  const { user, isRestoring } = useAuth()
  if (isRestoring) return <div className="flex min-h-screen items-center justify-center bg-bg-base text-sm text-text-muted">Restoring your session...</div>
  if (!user) return <div className="min-h-screen bg-bg-base text-text-primary"><OnboardingHeader /><AccountProgress /><main className="mx-auto w-full max-w-[92rem] px-6 pb-12 pt-14 sm:px-8 sm:pt-20 lg:px-12"><OnboardingAccountSetup /></main></div>
  return <OnboardingProvider><OnboardingShell /></OnboardingProvider>
}
