# Top-Level GRC Workspaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the top-level Risks, Controls, and Evidence pages distinct, posture-driven workspaces backed by organization-wide aggregate APIs while preserving existing detail workflows.

**Architecture:** Add one tenant-scoped summary method and route per domain, using Prisma aggregates and bounded attention queues. Add typed frontend summary clients and render a domain-specific posture/attention area above each existing register, removing only the redundant inner headings from the three register pages.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Vitest, Next.js, React, TanStack Query, Tailwind CSS.

## Global Constraints

- Do not duplicate detail-page Risk Matrix, assessment, treatment, execution, artifact, version, checksum, or traceability workflows.
- Do not calculate organization-wide metrics from paginated frontend results.
- Reuse existing authorization, pagination, API clients, query keys, error handling, Swagger, and UI primitives.
- Do not introduce persisted summary fields or summary tables.
- Preserve existing unrelated worktree changes.

---

### Task 1: Add pure aggregate helpers and failing tests

**Files:**
- Create: `apps/api/src/modules/risks/risks-summary.utils.ts`
- Create: `apps/api/src/modules/risks/risks-summary.utils.spec.ts`
- Create: `apps/api/src/modules/controls/controls-summary.utils.ts`
- Create: `apps/api/src/modules/controls/controls-summary.utils.spec.ts`
- Create: `apps/api/src/modules/evidence/evidence-summary.utils.ts`
- Create: `apps/api/src/modules/evidence/evidence-summary.utils.spec.ts`

**Interfaces:**
- Produce deterministic functions for classifying attention items and calculating date windows from injected `now` values.
- Keep database access in services; helpers must be unit-testable.

- [ ] Write failing tests for risk attention classification, control overdue/due-soon classification, and evidence expiry/version/linkage classification.
- [ ] Run `pnpm --filter @risksphere/api test -- risks-summary.utils.spec.ts controls-summary.utils.spec.ts evidence-summary.utils.spec.ts` and verify the expected missing-module failures.
- [ ] Implement the smallest pure helpers needed by the service summaries.
- [ ] Re-run the focused tests and verify they pass.

### Task 2: Add backend organization-wide summary endpoints

**Files:**
- Modify: `apps/api/src/modules/risks/risks.service.ts`
- Modify: `apps/api/src/modules/risks/risks.controller.ts`
- Modify: `apps/api/src/modules/controls/controls.service.ts`
- Modify: `apps/api/src/modules/controls/controls.controller.ts`
- Modify: `apps/api/src/modules/evidence/evidence.service.ts`
- Modify: `apps/api/src/modules/evidence/evidence.controller.ts`
- Modify: `apps/api/prisma/schema.prisma` only if query review identifies a missing useful composite index
- Create: `apps/api/prisma/migrations/<timestamp>_top_level_summary_indexes/migration.sql` only if schema indexes are added

**Interfaces:**
- `GET /organizations/:organizationId/risks/summary`
- `GET /organizations/:organizationId/controls/summary`
- `GET /organizations/:organizationId/evidence/summary`
- Each method accepts the existing `OrganizationAccess` and returns organization-wide counts plus bounded attention records.

- [ ] Add service tests or extend existing service tests for empty organizations, tenant scoping, and boundary dates.
- [ ] Run focused backend tests and confirm failures before implementation.
- [ ] Implement aggregate queries using Prisma `count`, `groupBy`, relation filters, and bounded `findMany` queues without per-record N+1 lookups.
- [ ] Add Swagger operation/response metadata following existing controller conventions.
- [ ] Add only justified indexes after reviewing generated query predicates.
- [ ] Run API typecheck, lint, and tests.

### Task 3: Add typed frontend summary clients and query hooks

**Files:**
- Modify: `apps/web/src/features/risks/risk-api.ts`
- Modify: `apps/web/src/features/controls/control-api.ts`
- Modify: `apps/web/src/features/evidence/evidence-api.ts`

**Interfaces:**
- Add `getRiskSummary(organizationId)`.
- Add `getControlSummary(organizationId)`.
- Add `getEvidenceSummary(organizationId)`.
- Define response types matching the backend contracts and use query keys scoped by organization.

- [ ] Add compile-level/type-focused tests or fixtures for the three response shapes.
- [ ] Verify the frontend typecheck fails before the new functions/types exist.
- [ ] Implement typed API functions using the existing `apiRequest` helper.
- [ ] Run frontend typecheck.

### Task 4: Redesign the Risks top-level page

**Files:**
- Modify: `apps/web/src/features/risks/risks-register.tsx`
- Modify: `apps/web/src/features/risks/risk-loading.tsx`
- Reuse: `apps/web/src/features/risks/risk-api.ts`, `risk-ui.tsx`, existing detail route

- [ ] Add a failing render/type check for the new posture and attention sections.
- [ ] Query the organization-wide risk summary independently from the paginated register.
- [ ] Remove the inner `Management` eyebrow and redundant `Risk register` heading/description while retaining the CTA.
- [ ] Add risk posture cards, severity distribution, and bounded attention queue with links to `/risks/[riskId]`.
- [ ] Add summary loading, error, empty, and responsive states.
- [ ] Preserve register filters, pagination, existing empty state, and mobile rows.
- [ ] Run frontend lint and typecheck.

### Task 5: Redesign the Controls top-level page

**Files:**
- Modify: `apps/web/src/features/controls/controls-register.tsx`
- Modify: `apps/web/src/features/controls/control-loading.tsx`
- Reuse: `apps/web/src/features/controls/control-api.ts`, `control-ui.tsx`, existing detail route

- [ ] Add a failing render/type check for operations health and upcoming-work sections.
- [ ] Query the organization-wide control summary independently from the paginated register.
- [ ] Remove the inner `Management` eyebrow and redundant register heading while retaining the CTA.
- [ ] Add operational-health cards and an upcoming/attention queue linking to `/controls/[controlId]`.
- [ ] Add summary loading, error, empty, and responsive states.
- [ ] Preserve existing filters, sorting, pagination, empty state, and mobile rows.
- [ ] Run frontend lint and typecheck.

### Task 6: Redesign the Evidence top-level page

**Files:**
- Modify: `apps/web/src/features/evidence/evidence-register.tsx`
- Modify: `apps/web/src/features/evidence/evidence-loading.tsx`
- Reuse: `apps/web/src/features/evidence/evidence-api.ts`, existing detail route

- [ ] Add a failing render/type check for evidence health and freshness/traceability sections.
- [ ] Query the organization-wide evidence summary independently from the paginated register.
- [ ] Remove the inner `Management` eyebrow and duplicate Evidence heading/description while retaining the CTA.
- [ ] Add health cards and bounded attention queue linking to `/evidence/[evidenceId]`.
- [ ] Add summary loading, error, empty, and responsive states.
- [ ] Preserve existing filters, sorting, pagination, empty state, and mobile rows.
- [ ] Run frontend lint and typecheck.

### Task 7: Verify the full-stack redesign

**Files:**
- Modify only files required by verification findings.

- [ ] Run `pnpm --filter @risksphere/api test`.
- [ ] Run `pnpm --filter @risksphere/api typecheck`.
- [ ] Run `pnpm --filter @risksphere/api lint`.
- [ ] Run `pnpm --filter @risksphere/web typecheck`.
- [ ] Run `pnpm --filter @risksphere/web lint`.
- [ ] Inspect the final diff to confirm detail pages and unrelated worktree changes were not modified unintentionally.
- [ ] Verify no organization-wide metric is derived from paginated frontend data.
