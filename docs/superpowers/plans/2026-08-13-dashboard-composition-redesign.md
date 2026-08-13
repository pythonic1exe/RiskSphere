# Dashboard Composition Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the RiskSphere authenticated Home dashboard into a spacious, dark workspace canvas with one dominant readiness visualization and varied supporting surfaces.

**Architecture:** Preserve the existing `/workspace` route and organization loading. Refactor dashboard-only components and mock data presentation, keeping navigation/auth/onboarding code stable.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, `motion/react`, Lucide icons, existing RiskSphere design tokens.

## Global Constraints

- Do not change backend, authentication, onboarding, APIs, RBAC, database models, landing pages, or unrelated routes.
- Keep the established RiskSphere palette and fonts.
- Use mock data only and no new dependencies.
- Preserve icon-first hover/focus navigation behavior.
- Keep the dashboard responsive without horizontal overflow.

---

### Task 1: Refine Shell and Sidebar

**Files:**
- Modify: `apps/web/src/features/dashboard/dashboard-shell.tsx`
- Modify: `apps/web/src/features/dashboard/dashboard-sidebar.tsx`
- Modify: `apps/web/src/features/dashboard/dashboard-header.tsx`

- [ ] Replace the header copy with `Dashboard` and the organization overview sentence.
- [ ] Give the shell a layered workspace canvas with more breathing room and less default card framing.
- [ ] Simplify sidebar group labels, center the rail rhythm, and retain per-item hover/focus expansion.
- [ ] Run `pnpm --filter @risksphere/web typecheck`.

### Task 2: Recompose Hero Overview and Readiness Visualization

**Files:**
- Modify: `apps/web/src/features/dashboard/dashboard-home.tsx`
- Modify: `apps/web/src/features/dashboard/grc-overview-card.tsx`
- Modify: `apps/web/src/features/dashboard/analytics-card.tsx`
- Modify: `apps/web/src/features/dashboard/metric-card.tsx`

- [ ] Replace the donut widget with a typographic readiness anchor and quiet progress rows.
- [ ] Replace the generic bars with one smooth CSS trend visualization using the existing mock trend values.
- [ ] Move important metrics into a supporting stat strip instead of three identical standalone cards.
- [ ] Run typecheck.

### Task 3: Vary Supporting Surfaces

**Files:**
- Modify: `apps/web/src/features/dashboard/dashboard-card.tsx`
- Modify: `apps/web/src/features/dashboard/my-tasks-card.tsx`
- Modify: `apps/web/src/features/dashboard/attention-required-card.tsx`
- Modify: `apps/web/src/features/dashboard/upcoming-card.tsx`
- Modify: `apps/web/src/features/dashboard/recent-activity-card.tsx`

- [ ] Remove repeated eyebrow/action-header patterns.
- [ ] Use varied surface tones, larger radii, and relaxed spacing while preserving compact GRC rows.
- [ ] Keep severity styling subtle and meaningful.
- [ ] Run typecheck.

### Task 4: Verify the Redesign

- [ ] Run `pnpm --filter @risksphere/web typecheck`.
- [ ] Run `pnpm --filter @risksphere/web build` and confirm `/workspace` is generated.
- [ ] Run `pnpm --filter @risksphere/web exec eslint src/features/dashboard`.
- [ ] Run `git diff --check` and inspect that only dashboard files plus the approved design docs changed.
