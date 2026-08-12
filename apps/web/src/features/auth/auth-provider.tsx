"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { authenticate, logoutSession, restoreSession, type AuthUser } from "./auth-client"

type AuthContextValue = {
  user: AuthUser | null
  isRestoring: boolean
  isSubmitting: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  register: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    restoreSession().then(setUser).finally(() => setIsRestoring(false))
  }, [])

  async function authenticateUser(path: "/auth/login" | "/auth/register", email: string, password: string) {
    setIsSubmitting(true)
    setError(null)
    try {
      const session = await authenticate(path, email, password)
      setUser(session.user)
      return session.user
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Authentication failed"
      setError(message)
      throw cause
    } finally {
      setIsSubmitting(false)
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isRestoring,
    isSubmitting,
    error,
    login: (email, password) => authenticateUser("/auth/login", email, password),
    register: (email, password) => authenticateUser("/auth/register", email, password),
    logout: async () => { await logoutSession(); setUser(null) },
    clearError: () => setError(null),
  }), [error, isRestoring, isSubmitting, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
