import type { Metadata } from "next"

import { ProtectedRoute } from "@/features/auth/protected-route"
import { WorkspaceHome } from "@/features/auth/workspace-home"

export const metadata: Metadata = { title: "Workspace | RiskSphere" }

export default function WorkspacePage() {
  return <ProtectedRoute><WorkspaceHome /></ProtectedRoute>
}
