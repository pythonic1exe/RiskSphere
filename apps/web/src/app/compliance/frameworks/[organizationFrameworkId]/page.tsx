import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { FrameworkDetailWorkspace } from "@/features/compliance/compliance-framework-detail"

export const metadata: Metadata = { title: "Framework | Compliance | RiskSphere" }
export default function FrameworkPage() { return <ProtectedRoute><FrameworkDetailWorkspace /></ProtectedRoute> }
