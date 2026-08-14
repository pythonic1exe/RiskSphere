import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { RiskDetailWorkspace } from "@/features/risks/risk-detail"

export const metadata: Metadata = { title: "Risk detail | RiskSphere" }

export default function RiskDetailPage() { return <ProtectedRoute><RiskDetailWorkspace /></ProtectedRoute> }
