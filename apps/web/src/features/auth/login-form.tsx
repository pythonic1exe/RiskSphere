"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { getAuthenticatedDestination, getMyOrganizations } from "./auth-client"
import { useAuth } from "./auth-provider"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sanitizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return undefined
  }

  return nextPath
}

export function LoginForm({ nextPath }: { nextPath?: string } = {}) {
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  const { login, isSubmitting, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitted, setSubmitted] = useState(false)

  const emailError = email.length === 0
    ? "Email is required."
    : !emailPattern.test(email)
      ? "Enter a valid email address."
      : undefined
  const passwordError = password.length === 0 ? "Password is required." : undefined
  const showEmailError = submitted || touched.email
  const showPasswordError = submitted || touched.password
  const formIsValid = !emailError && !passwordError

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setTouched({ email: true, password: true })
    if (!formIsValid) return
    try {
      await login(email, password)
      router.replace(sanitizeNextPath(nextPath) ?? getAuthenticatedDestination(await getMyOrganizations()))
    } catch {
      // AuthProvider exposes the server error inline below the form.
    }
  }

  return (
    <motion.form
      className="relative w-full max-w-[30rem] overflow-hidden rounded-2xl border border-[#263244] bg-bg-app px-8 py-9 sm:px-10 sm:py-10"
      onSubmit={handleSubmit}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
      noValidate
    >
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Welcome back</p>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">Sign in to RiskSphere</h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">Continue managing your risk, controls, and compliance workspace.</p>
      </div>

      <div className="mt-9 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="signin-email" className="text-foreground">Email address</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="name@company.com"
            className="h-12"
            aria-invalid={showEmailError && Boolean(emailError)}
            aria-describedby={showEmailError && emailError ? "signin-email-error" : undefined}
            onChange={(event) => { setEmail(event.target.value); clearError() }}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          />
          {showEmailError && emailError ? <p id="signin-email-error" className="text-xs text-danger" role="alert">{emailError}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signin-password" className="text-foreground">Password</Label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-12 pr-11"
              aria-invalid={showPasswordError && Boolean(passwordError)}
              aria-describedby={showPasswordError && passwordError ? "signin-password-error" : undefined}
              onChange={(event) => { setPassword(event.target.value); clearError() }}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
          {showPasswordError && passwordError ? <p id="signin-password-error" className="text-xs text-danger" role="alert">{passwordError}</p> : null}
        </div>

      </div>
      {error ? <p className="mt-5 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger" role="alert">{error}</p> : null}
      <div className="mt-6">
        <motion.div {...(reducedMotion ? {} : { whileHover: { y: -1 }, whileTap: { y: 0 } })}>
          <Button type="submit" size="lg" className="h-12 w-full" disabled={isSubmitting || (submitted && !formIsValid)}>{isSubmitting ? "Signing in..." : "Sign in"}<ArrowRight className="size-4" aria-hidden="true" /></Button>
        </motion.div>
        <p className="mt-5 text-center text-sm text-muted-foreground">New organization? <Link href="/onboarding" className="font-medium text-primary hover:text-primary-hover">Start onboarding</Link></p>
      </div>
      <BorderBeam
        duration={8}
        size={120}
        borderWidth={1}
        colorFrom="#3B82F6"
        colorTo="#22D3EE"
        {...(reducedMotion ? { className: "hidden" } : {})}
      />
    </motion.form>
  )
}
