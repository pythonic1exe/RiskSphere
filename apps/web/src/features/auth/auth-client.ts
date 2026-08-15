export type AuthUser = {
  id: string
  email: string
  displayName?: string | null
  jobTitle?: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  sessionExpiresAt: string
}

export type OrganizationSummary = {
  id: string
  name: string
  slug: string
  status: string
  membershipId: string
  membershipStatus: string
  onboarding: {
    status: string
    currentStep: string | null
    lastStep: string | null
  } | null
  roles: Array<{ id: string; code: string; name: string }>
}

type AuthResponse = { user: AuthUser; tokens: AuthTokens }
type ApiOptions = globalThis.RequestInit & { skipRefresh?: boolean }

// Next replaces this public build-time variable for the browser bundle.
// eslint-disable-next-line no-undef
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1"
const storageKey = "risksphere:auth-session:v1"
let refreshPromise: Promise<AuthTokens | null> | null = null

function readSession(): AuthResponse | null {
  if (typeof window === "undefined") return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as AuthResponse | null
    return parsed?.tokens?.accessToken && parsed.tokens.refreshToken ? parsed : null
  } catch {
    window.localStorage.removeItem(storageKey)
    return null
  }
}

function writeSession(session: AuthResponse) {
  window.localStorage.setItem(storageKey, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(storageKey)
}

export function getSession() {
  return readSession()
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

async function parseResponse<T>(response: globalThis.Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { message?: string | string[]; [key: string]: unknown } | null
  if (!response.ok) {
    const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message
    throw new ApiError(message ?? `Request failed with status ${response.status}`, response.status, payload)
  }
  return payload as T
}

async function refreshTokens(): Promise<AuthTokens | null> {
  if (refreshPromise) return refreshPromise
  const session = readSession()
  if (!session?.tokens.refreshToken) return null

  refreshPromise = globalThis.fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.tokens.refreshToken }),
  })
    .then((response) => parseResponse<AuthResponse>(response))
    .then((nextSession) => {
      writeSession(nextSession)
      return nextSession.tokens
    })
    .catch(() => {
      clearSession()
      return null
    })
    .finally(() => { refreshPromise = null })

  return refreshPromise
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const session = readSession()
  const headers = new globalThis.Headers(options.headers)
  if (options.body && !headers.has("Content-Type") && !(options.body instanceof globalThis.FormData)) headers.set("Content-Type", "application/json")
  if (session?.tokens.accessToken) headers.set("Authorization", `Bearer ${session.tokens.accessToken}`)

  const response = await globalThis.fetch(`${apiBaseUrl}${path}`, { ...options, headers })
  if (response.status === 401 && !options.skipRefresh && !path.startsWith("/auth/")) {
    const tokens = await refreshTokens()
    if (tokens) return apiRequest<T>(path, { ...options, skipRefresh: true })
  }
  return parseResponse<T>(response)
}

export async function authenticate(path: "/auth/login" | "/auth/register", email: string, password: string) {
  const response = await globalThis.fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const session = await parseResponse<AuthResponse>(response)
  writeSession(session)
  return session
}

export async function logoutSession() {
  try {
    if (readSession()) await apiRequest<{ success: boolean }>("/auth/logout", { method: "POST" })
  } finally {
    clearSession()
  }
}

export async function restoreSession() {
  if (!readSession()) return null
  try {
    const user = await apiRequest<AuthUser>("/auth/me")
    const session = readSession()
    if (session) writeSession({ ...session, user })
    return user
  } catch {
    clearSession()
    return null
  }
}

export async function getMyOrganizations() {
  const response = await apiRequest<{ organizations: OrganizationSummary[] }>("/organizations/mine")
  return response.organizations
}

export async function acceptInvitation(token: string) {
  return apiRequest<{ invitation: { id: string } }>("/organization-invitations/accept", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}

export function getAuthenticatedDestination(organizations: OrganizationSummary[]) {
  return organizations.some((organization) => organization.status === "ACTIVE" && organization.onboarding?.status === "COMPLETED")
    ? "/workspace"
    : "/onboarding"
}
