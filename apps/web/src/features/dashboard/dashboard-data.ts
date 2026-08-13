import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Flag,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export type DashboardNavGroup = {
  label: string
  items: DashboardNavItem[]
}

export type DashboardData = {
  readiness: number
  readinessBreakdown: Array<{ label: string; value: number }>
  metrics: Array<{ label: string; value: string; detail: string; tone: "danger" | "success" | "info" }>
  trend: number[]
  attention: Array<{ label: string; detail: string; tone: "danger" | "warning" | "info" }>
  tasks: Array<{ title: string; entity: string; due: string; status: "In progress" | "Due today" | "Queued" }>
  upcoming: Array<{ title: string; date: string; type: string }>
  activity: Array<{ actor: string; action: string; entity: string; time: string; tone: "blue" | "cyan" | "green" | "amber" }>
}

export const dashboardNavigation: DashboardNavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/workspace", icon: LayoutDashboard }] },
  {
    label: "Management",
    items: [
      { label: "Risks", href: "/risks", icon: ShieldAlert },
      { label: "Controls", href: "/controls", icon: SlidersHorizontal },
      { label: "Compliance", href: "/compliance", icon: Gauge },
      { label: "Evidence", href: "/evidence", icon: FileCheck2 },
    ],
  },
  {
    label: "Assurance",
    items: [
      { label: "Audits", href: "/audits", icon: ClipboardCheck },
      { label: "Findings", href: "/findings", icon: Flag },
    ],
  },
  { label: "Work", items: [{ label: "Tasks", href: "/tasks", icon: ListChecks }] },
  {
    label: "Workspace",
    items: [
      { label: "Organization", href: "/organization", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export const dashboardData: DashboardData = {
  readiness: 82,
  readinessBreakdown: [
    { label: "Controls", value: 84 },
    { label: "Compliance", value: 76 },
    { label: "Evidence", value: 80 },
    { label: "Audit readiness", value: 69 },
  ],
  metrics: [
    { label: "Active risks", value: "24", detail: "3 high / critical", tone: "danger" },
    { label: "Compliance coverage", value: "76%", detail: "+4% from previous period", tone: "success" },
    { label: "Active audits", value: "3", detail: "1 starting this week", tone: "info" },
  ],
  trend: [54, 58, 56, 64, 68, 66, 74, 78, 82],
  attention: [
    { label: "Overdue control executions", detail: "4 items need owners", tone: "danger" },
    { label: "Missing evidence items", detail: "2 requests are blocked", tone: "warning" },
    { label: "High risk without treatment", detail: "R-104 requires review", tone: "danger" },
    { label: "Overdue findings", detail: "3 remediation plans", tone: "info" },
  ],
  tasks: [
    { title: "Review Control AC-07", entity: "Control execution", due: "Today", status: "Due today" },
    { title: "Upload evidence", entity: "ISO 27001", due: "Aug 15", status: "In progress" },
    { title: "Resolve Finding F-003", entity: "Internal audit", due: "Aug 17", status: "Queued" },
    { title: "Complete risk assessment", entity: "Risk R-104", due: "Aug 20", status: "Queued" },
  ],
  upcoming: [
    { title: "Control review", date: "Today", type: "Review" },
    { title: "Evidence due", date: "Aug 15", type: "Deadline" },
    { title: "Internal audit starts", date: "Aug 20", type: "Audit" },
    { title: "Risk review", date: "Aug 22", type: "Workshop" },
  ],
  activity: [
    { actor: "SA", action: "uploaded evidence to", entity: "Control AC-07", time: "12 min ago", tone: "cyan" },
    { actor: "JM", action: "completed execution for", entity: "Control AC-12", time: "1 hour ago", tone: "green" },
    { actor: "RK", action: "assigned", entity: "Finding F-003", time: "Yesterday", tone: "amber" },
    { actor: "US", action: "reassessed", entity: "Risk R-104", time: "Yesterday", tone: "blue" },
  ],
}

export const dashboardQuickActions = [
  { label: "Reports", icon: BarChart3 },
  { label: "Documents", icon: FileText },
]
