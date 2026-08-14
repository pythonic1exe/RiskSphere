import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { RisksWorkspace } from "@/features/risks/risks-register"

export const metadata: Metadata = { title: "Risks | RiskSphere" }

export default function RisksPage() { return <ProtectedRoute><RisksWorkspace /></ProtectedRoute> }
