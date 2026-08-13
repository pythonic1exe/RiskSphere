import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { ControlDetailWorkspace } from "@/features/controls/control-detail"

export const metadata: Metadata = { title: "Control | RiskSphere" }
export default function ControlDetailPage() { return <ProtectedRoute><ControlDetailWorkspace /></ProtectedRoute> }
