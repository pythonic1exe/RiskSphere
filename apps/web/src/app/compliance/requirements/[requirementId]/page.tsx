import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { RequirementDetailWorkspace } from "@/features/compliance/compliance-requirement-detail"

export const metadata: Metadata = { title: "Requirement | Compliance | RiskSphere" }
export default function RequirementPage() { return <ProtectedRoute><RequirementDetailWorkspace /></ProtectedRoute> }
