import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { EvidenceDetailWorkspace } from "@/features/evidence/evidence-detail"

export const metadata: Metadata = { title: "Evidence detail | RiskSphere" }
export default function EvidenceDetailPage() { return <ProtectedRoute><EvidenceDetailWorkspace /></ProtectedRoute> }
