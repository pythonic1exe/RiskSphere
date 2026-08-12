"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/features/auth/auth-provider"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function OnboardingAccountSetup() {
  const reducedMotion = useReducedMotion()
  const { register, isSubmitting, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const emailError = email.length === 0 ? "Email is required." : !emailPattern.test(email) ? "Enter a valid email address." : undefined
  const passwordError = password.length === 0 ? "Password is required." : password.length < 8 ? "Use at least 8 characters." : undefined
  const confirmationError = confirmation.length === 0 ? "Confirm your password." : confirmation !== password ? "Passwords do not match." : undefined
  const valid = !emailError && !passwordError && !confirmationError

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!valid) return
    try { await register(email, password) } catch { /* AuthProvider exposes the error inline. */ }
  }

  return <motion.form className="mx-auto w-full max-w-xl" onSubmit={handleSubmit} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: "easeOut" }} noValidate>
    <div className="space-y-2"><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Organization account</p><h1 className="font-heading text-4xl font-medium leading-[1.03] tracking-[-0.05em] text-text-primary sm:text-5xl">Create your organization account</h1><p className="mt-5 max-w-xl text-base leading-7 text-text-muted sm:text-lg">Start your RiskSphere workspace setup. You will become the owner and can invite your team during onboarding.</p></div>
    <div className="mt-10 space-y-5"><div className="space-y-2"><Label htmlFor="onboarding-account-email" className="text-text-secondary">Email address</Label><Input id="onboarding-account-email" type="email" value={email} autoComplete="email" placeholder="name@company.com" className="h-11" aria-invalid={submitted && Boolean(emailError)} onChange={(event) => { setEmail(event.target.value); clearError() }} />{submitted && emailError ? <p className="text-xs text-danger" role="alert">{emailError}</p> : null}</div><div className="space-y-2"><Label htmlFor="onboarding-account-password" className="text-text-secondary">Password</Label><Input id="onboarding-account-password" type="password" value={password} autoComplete="new-password" placeholder="At least 8 characters" className="h-11" aria-invalid={submitted && Boolean(passwordError)} onChange={(event) => { setPassword(event.target.value); clearError() }} />{submitted && passwordError ? <p className="text-xs text-danger" role="alert">{passwordError}</p> : null}</div><div className="space-y-2"><Label htmlFor="onboarding-account-confirmation" className="text-text-secondary">Confirm password</Label><Input id="onboarding-account-confirmation" type="password" value={confirmation} autoComplete="new-password" placeholder="Repeat your password" className="h-11" aria-invalid={submitted && Boolean(confirmationError)} onChange={(event) => setConfirmation(event.target.value)} />{submitted && confirmationError ? <p className="text-xs text-danger" role="alert">{confirmationError}</p> : null}</div>{error ? <p className="rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger" role="alert">{error}</p> : null}<Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Continue to organization setup"}<ArrowRight className="size-4" aria-hidden="true" /></Button><p className="text-sm text-text-muted">Already have an account? <Link href="/login" className="font-medium text-primary hover:text-primary-hover">Log in</Link></p></div>
  </motion.form>
}
