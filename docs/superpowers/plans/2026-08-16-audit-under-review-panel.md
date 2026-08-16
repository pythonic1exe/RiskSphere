# Audit Under Review Panel Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the existing audit detail header with a restrained elevated panel, under-review accent, compact status treatment, and the requested progress colors without changing its structure.

**Architecture:** Modify the existing `audit-detail.tsx` presentation only. Keep the current audit data, lifecycle actions, responsive layout, and component boundaries intact; use existing Tailwind theme tokens where possible and exact color values only for the requested visual states.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, existing RiskSphere UI tokens.

## Global Constraints

- Do not redesign or reorder the audit header.
- Do not change audit API calls, lifecycle behavior, or data models.
- Use `#111827`, `#263244`, `#F59E0B`, `#3B82F6`, and `#1E293B` only for the requested visual treatments.
- Preserve responsive behavior and existing actions.

---

### Task 1: Update the audit detail header presentation

**Files:**
- Modify: `apps/web/src/features/audits/audit-detail.tsx`

- [ ] **Step 1: Update progress colors**

Change the progress track to `#1E293B` and the completion fill to `#3B82F6`; keep the existing percentage calculation and dimensions.

- [ ] **Step 2: Add the restrained header panel**

Wrap the existing header contents in the requested dark bordered panel, adding a 3px amber left border only for `UNDER_REVIEW`, while preserving the current title, metadata, actions, lifecycle rail, and cancellation message.

- [ ] **Step 3: Compact the status presentation**

Render the current lifecycle status as a small amber dot with restrained text for `UNDER_REVIEW`; leave other status semantics unchanged.

- [ ] **Step 4: Add optional visual separators**

Use subtle vertical separators only in the existing metadata grouping if they improve grouping at larger widths; do not introduce new information or layout regions.

- [ ] **Step 5: Verify the affected frontend**

Run:

```bash
pnpm --filter @risksphere/web typecheck
```

Expected: the web package typecheck completes successfully.

- [ ] **Step 6: Review the diff**

Run `git diff -- apps/web/src/features/audits/audit-detail.tsx` and confirm only the requested presentation classes/markup changed.
