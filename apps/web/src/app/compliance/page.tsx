import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { ComplianceRegister } from "@/features/compliance/compliance-register"

export const metadata: Metadata = { title: "Compliance | RiskSphere" }
export default function CompliancePage() { return <ProtectedRoute><ComplianceRegister /></ProtectedRoute> }
