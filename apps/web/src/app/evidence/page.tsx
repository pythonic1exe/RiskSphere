import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { EvidenceRegister } from "@/features/evidence/evidence-register"

export const metadata: Metadata = { title: "Evidence | RiskSphere" }
export default function EvidencePage() { return <ProtectedRoute><EvidenceRegister /></ProtectedRoute> }
