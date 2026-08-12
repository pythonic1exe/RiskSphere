"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, CheckCircle2, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BorderBeam } from "@/components/ui/border-beam"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { acceptInvitation, getAuthenticatedDestination, getMyOrganizations } from "./auth-client"
import { useAuth } from "./auth-provider"

function buildLoginHref(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`
}

export function InvitationAcceptanceForm({ initialToken = "" }: { initialToken?: string } = {}) {
  const reducedMotion = useReducedMotion()
  const router = useRouter()
  const { user, isRestoring } = useAuth()
  const [token, setToken] = useState(initialToken)
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tokenError = token.trim().length === 0 ? "Invitation token is required." : undefined
  const showTokenError = submitted && Boolean(tokenError)
  const loginHref = buildLoginHref(`/accept-invitation?token=${encodeURIComponent(token.trim())}`)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    setSuccess(false)
    if (tokenError) return
    if (!user) {
      setError("Sign in with the invited account before accepting the invitation.")
      return
    }

    try {
      await acceptInvitation(token.trim())
      setSuccess(true)
      const organizations = await getMyOrganizations()
      router.replace(getAuthenticatedDestination(organizations))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to accept invitation")
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
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Invitation</p>
        <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">Accept your workspace invite</h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">Use the invitation token from your email to join the organization on RiskSphere.</p>
      </div>

      <div className="mt-9 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="invitation-token" className="text-foreground">Invitation token</Label>
          <Input
            id="invitation-token"
            type="text"
            value={token}
            autoComplete="one-time-code"
            placeholder="Paste your invitation token"
            className="h-12"
            aria-invalid={showTokenError && Boolean(tokenError)}
            aria-describedby={showTokenError && tokenError ? "invitation-token-error" : undefined}
            onChange={(event) => {
              setToken(event.target.value)
              setError(null)
              setSuccess(false)
            }}
          />
          {showTokenError && tokenError ? <p id="invitation-token-error" className="text-xs text-danger" role="alert">{tokenError}</p> : null}
        </div>

        <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Signed in account</p>
          <p className="mt-2 text-sm text-foreground">
            {isRestoring ? "Checking your session..." : user ? user.email : "You are not signed in."}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {user
              ? "This invitation will be accepted for the account shown above."
              : "Sign in with the invited email address, then return here to accept the invite."}
          </p>
        </div>
      </div>

      {error ? <p className="mt-5 rounded-lg border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger" role="alert">{error}</p> : null}
      {success ? (
        <p className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700" role="status">
          Invitation accepted. Redirecting you now.
        </p>
      ) : null}

      <div className="mt-6 space-y-3">
        <motion.div {...(reducedMotion ? {} : { whileHover: { y: -1 }, whileTap: { y: 0 } })}>
          <Button type="submit" size="lg" className="h-12 w-full" disabled={isRestoring || !user || (submitted && !token.trim())}>
            Accept invitation
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </motion.div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {!user ? (
            <Button type="button" variant="outline" size="lg" className="h-12 w-full" onClick={() => router.push(loginHref)}>
              <LogIn className="size-4" aria-hidden="true" />
              Sign in first
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>.
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Need the invite email again? Ask your workspace admin to resend it.
        </p>
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
