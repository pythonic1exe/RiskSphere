import type { Metadata } from "next"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { ControlsWorkspace } from "@/features/controls/controls-register"

export const metadata: Metadata = { title: "Controls | RiskSphere" }
export default function ControlsPage() { return <ProtectedRoute><ControlsWorkspace /></ProtectedRoute> }
