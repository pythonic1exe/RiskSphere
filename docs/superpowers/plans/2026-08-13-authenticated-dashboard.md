# Authenticated RiskSphere Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the RiskSphere authenticated Home dashboard at `/workspace` with a reusable icon-first shell, responsive asymmetric layout, and typed mock GRC data.

**Architecture:** Keep `WorkspaceHome` responsible for organization loading and authenticated redirects. Add a dashboard feature folder containing typed mock data, shell/navigation components, header, and focused card components. Render the dashboard through the existing protected `/workspace` page without changing onboarding or auth destination logic.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, `motion/react`, `lucide-react`, existing RiskSphere CSS tokens.

## Global Constraints

- `/workspace` remains the canonical authenticated Home route.
- Use mock data only; do not add dashboard API calls.
- Preserve existing RiskSphere colors and fonts.
- Do not implement RBAC-specific navigation.
- Use existing dependencies; do not add an animation or icon dependency.
- Respect reduced-motion preferences.
- Keep module routes presentational until their pages exist.

---

### Task 1: Add Typed Dashboard Mock Data

**Files:**
- Create: `apps/web/src/features/dashboard/dashboard-data.ts`
- Test: `apps/web/src/features/dashboard/dashboard-data.test.ts` only if the existing frontend test harness supports colocated tests; otherwise verify through typecheck.

**Interfaces:**
- Produces `DashboardData`, navigation item/group types, and a `dashboardData` constant consumed by all dashboard components.

- [ ] **Step 1: Define the dashboard data interfaces and realistic mock values**

Create typed values for organization summary cards, attention rows, tasks, upcoming items, activity rows, and navigation groups. Use GRC-specific labels such as `AC-07`, `F-003`, and `R-104`, with no invented score formula.

- [ ] **Step 2: Run typecheck for the new module**

Run: `pnpm --filter @risksphere/web typecheck`
Expected: exit code `0`.

- [ ] **Step 3: Commit the data contract**

```bash
git add apps/web/src/features/dashboard/dashboard-data.ts
git commit -m "feat: add dashboard mock data"
```

### Task 2: Build the Dashboard Shell and Sidebar

**Files:**
- Create: `apps/web/src/features/dashboard/dashboard-shell.tsx`
- Create: `apps/web/src/features/dashboard/dashboard-sidebar.tsx`
- Modify: `apps/web/src/features/auth/workspace-home.tsx`

**Interfaces:**
- `DashboardShell` consumes `{ organizationName: string; userEmail?: string; children: ReactNode }`.
- `DashboardSidebar` consumes the navigation groups from `dashboard-data.ts` and exposes links for `/workspace`, `/risks`, `/controls`, `/compliance`, `/evidence`, `/audits`, `/findings`, `/tasks`, `/organization`, and `/settings`.

- [ ] **Step 1: Replace the placeholder workspace body with a shell handoff**

Keep the existing organization fetch and redirect check in `WorkspaceHome`. Replace the placeholder header/section with `<DashboardShell organizationName={organization.name} userEmail={user?.email}>{...}</DashboardShell>`.

- [ ] **Step 2: Implement icon-first grouped navigation**

Use Lucide icons already installed. Render each item as a compact link with an accessible `aria-label`, active state for `/workspace`, and a label that animates from zero width/opacity to visible width on hover and keyboard focus. Use `useReducedMotion()` so reduced-motion users receive the same state without animation.

- [ ] **Step 3: Add responsive shell behavior**

Use a fixed-width desktop rail and a mobile top/stacked navigation treatment. Keep the main content scrollable and prevent horizontal overflow. Include a logout action through the existing auth context.

- [ ] **Step 4: Run typecheck**

Run: `pnpm --filter @risksphere/web typecheck`
Expected: exit code `0`.

- [ ] **Step 5: Commit the shell**

```bash
git add apps/web/src/features/dashboard apps/web/src/features/auth/workspace-home.tsx
git commit -m "feat: add authenticated dashboard shell"
```

### Task 3: Add Header and Dashboard Card Components

**Files:**
- Create: `apps/web/src/features/dashboard/dashboard-header.tsx`
- Create: `apps/web/src/features/dashboard/dashboard-card.tsx`
- Create: `apps/web/src/features/dashboard/grc-overview-card.tsx`
- Create: `apps/web/src/features/dashboard/metric-card.tsx`
- Create: `apps/web/src/features/dashboard/analytics-card.tsx`
- Create: `apps/web/src/features/dashboard/attention-required-card.tsx`
- Create: `apps/web/src/features/dashboard/my-tasks-card.tsx`
- Create: `apps/web/src/features/dashboard/upcoming-card.tsx`
- Create: `apps/web/src/features/dashboard/recent-activity-card.tsx`

**Interfaces:**
- Cards consume the corresponding typed values from `DashboardData`.
- `DashboardHeader` consumes `{ organizationName: string; userEmail?: string; onLogout: () => Promise<void> }`.
- `DashboardCard` consumes `{ title: string; eyebrow?: string; actionLabel?: string; children: ReactNode; className?: string }`.

- [ ] **Step 1: Create the shared card frame**

Use `bg-card`, `border-subtle`, and a restrained radius. Keep title, supporting text, and optional action placement consistent across cards.

- [ ] **Step 2: Build the header**

Render a compact greeting such as `Good morning, Usman` with organization context, search and notification buttons, and a profile/logout control. Derive the first name from the email only as a fallback; do not add a new user API.

- [ ] **Step 3: Build overview and metric cards**

Render `82% Overall readiness` with four supporting progress rows, plus concise cards for active risks, compliance coverage, and active audits/open findings as space allows.

- [ ] **Step 4: Build analytics, attention, work, upcoming, and activity cards**

Use a simple SVG-free CSS line/area-like progress visualization or horizontal bars for analytics, semantic severity indicators for attention, compact list rows for work/upcoming, and actor initials plus relative times for activity.

- [ ] **Step 5: Run typecheck**

Run: `pnpm --filter @risksphere/web typecheck`
Expected: exit code `0`.

- [ ] **Step 6: Commit the dashboard components**

```bash
git add apps/web/src/features/dashboard
git commit -m "feat: add dashboard content cards"
```

### Task 4: Compose the Responsive Home Dashboard

**Files:**
- Create: `apps/web/src/features/dashboard/dashboard-home.tsx`
- Modify: `apps/web/src/features/dashboard/dashboard-shell.tsx`

**Interfaces:**
- `DashboardHome` consumes `DashboardData` and renders the complete Home composition.

- [ ] **Step 1: Compose the asymmetric grid**

Place the large overview beside compact KPIs, analytics beside Attention Required, My Tasks beside Upcoming, and Recent Activity across the full width. Use CSS grid column spans instead of absolute positioning.

- [ ] **Step 2: Add responsive breakpoints**

Collapse cards to one column at narrow widths and keep the first viewport readable at common laptop widths. Preserve card hierarchy and spacing when stacked.

- [ ] **Step 3: Wire Home into the shell**

Render `DashboardHeader` and `DashboardHome` from `DashboardShell`, passing organization/user context and mock data.

- [ ] **Step 4: Run the production build**

Run: `pnpm --filter @risksphere/web build`
Expected: exit code `0` and a generated `/workspace` route.

- [ ] **Step 5: Commit the composed Home screen**

```bash
git add apps/web/src/features/dashboard
git commit -m "feat: compose risksphere home dashboard"
```

### Task 5: Verify Route Compatibility and Final Quality

**Files:**
- Modify: `apps/web/src/app/workspace/page.tsx` only if metadata needs updating.
- Modify: `apps/web/src/features/auth/auth-client.ts` only if verification finds the destination contract changed; expected result is no modification.

- [ ] **Step 1: Confirm completed onboarding still targets `/workspace`**

Inspect `apps/web/src/features/onboarding/state.tsx` and `apps/web/src/features/auth/auth-client.ts`; retain `/workspace` in both completed-organization paths.

- [ ] **Step 2: Run the full focused web verification**

```bash
pnpm --filter @risksphere/web typecheck
pnpm --filter @risksphere/web build
```

Expected: both commands exit `0`; the build output includes `/workspace` and no new TypeScript or prerender errors.

- [ ] **Step 3: Review the final diff**

Run: `git diff HEAD~4 --stat && git status --short`
Expected: only dashboard implementation files and the intended route metadata are changed; no environment files or unrelated frontend features are modified.

- [ ] **Step 4: Commit any final metadata-only adjustment**

```bash
git add apps/web/src/app/workspace/page.tsx
git commit -m "chore: label workspace as dashboard"
```

Skip this commit when no metadata adjustment is needed.
