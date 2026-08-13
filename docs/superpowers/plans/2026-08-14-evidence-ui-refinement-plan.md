# Evidence UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the existing Evidence register and detail workspace around artifact identity, current artifact metadata, immutable version history, traceability, relationships, expiry, and Add Version copy without changing the global product shell.

**Architecture:** Reuse the existing Evidence API types, query keys, table, responsive rows, sheets, dialogs, and RiskSphere tokens. Keep formatting decisions in `evidence-format.ts`, list hierarchy in `evidence-register.tsx`, and detail hierarchy in `evidence-detail.tsx`; use existing API capabilities for URL/text presentation and explain unsupported file download.

**Tech Stack:** Next.js App Router, React, TypeScript, TanStack Query, Tailwind-style utility classes, Lucide icons, existing RiskSphere UI primitives.

## Global Constraints

- Preserve the current page shell, sidebar, typography, table patterns, filters, spacing, buttons, pagination, and overall RiskSphere design system.
- Keep approximately 70% shared product consistency and 30% Evidence-specific identity.
- Do not modify unrelated Risk, Controls, Compliance, sidebar, dashboard, or global design-system code.
- Do not add glassmorphism, glow, gradients, decorative SVGs, new icon libraries, or a new animation system.
- File evidence remains metadata-only for download/open because no secure backend file endpoint exists.
- Add Version must communicate append-only behavior: a new version is created and previous versions remain unchanged.

---

### Task 1: Refine Evidence artifact labels and expiry formatting

**Files:**
- Modify: `apps/web/src/features/evidence/evidence-format.ts`
- Test: existing Evidence formatting coverage if present; otherwise verify through the web typecheck/build in Task 4.

**Interfaces:**
- Preserve `latestVersion`, `versionFileLabel`, `expiryLabel`, `isExpiringSoon`, `formatFileSize`, and `shortenChecksum` signatures used by the register and detail components.
- Ensure `versionFileLabel` returns filename first, then URL for URL evidence, then type-specific labels.

- [ ] **Step 1: Inspect the existing formatter behavior**

Run:

```bash
sed -n '1,220p' apps/web/src/features/evidence/evidence-format.ts
rg -n "versionFileLabel|expiryLabel|isExpiringSoon|shortenChecksum" apps/web/src/features/evidence
```

Confirm that existing callers need no API changes.

- [ ] **Step 2: Implement only the missing artifact/expiry presentation helpers**

Keep date calculations and status semantics unchanged. Make sure missing versions render a stable type-specific fallback and that `expiryLabel` returns a muted-friendly value for absent expiry dates.

- [ ] **Step 3: Run focused Evidence lint**

```bash
pnpm --filter @risksphere/web exec eslint src/features/evidence/evidence-format.ts
```

Expected: exit code 0.

### Task 2: Refine the Evidence register rows

**Files:**
- Modify: `apps/web/src/features/evidence/evidence-register.tsx`

**Interfaces:**
- Preserve `EvidenceRegister`, `EvidenceTable`, `EvidenceRow`, `EvidenceMobileRow`, and existing navigation callback signatures.
- Continue using `latestVersion`, `versionFileLabel`, `expiryLabel`, and `isExpiringSoon` from `evidence-format.ts`.

- [ ] **Step 1: Add artifact-oriented primary cell hierarchy**

Update the existing `EvidenceName` rendering so it shows:

```tsx
<span className="block truncate text-sm font-medium text-text-primary">{evidence.title}</span>
<span className="mt-1 block truncate text-xs text-text-muted">
  {versionFileLabel(version, evidence.type)}
</span>
```

Keep the current grid/table structure and mobile row layout.

- [ ] **Step 2: Make version information explicit**

Render the existing version value as `v${version.versionNumber}` when available, while retaining the existing no-version fallback. Do not add a new column.

- [ ] **Step 3: Refine expiry tones**

Keep normal expiry muted, apply `text-warning` when `isExpiringSoon(evidence)` is true, and apply `text-danger` when the effective status is `EXPIRED`. Preserve the existing `Expiring soon` status pill behavior.

- [ ] **Step 4: Verify row navigation and responsive structure**

Run:

```bash
pnpm --filter @risksphere/web exec eslint src/features/evidence/evidence-register.tsx
```

Expected: exit code 0, with both desktop rows and mobile rows still calling `router.push(`/evidence/${id}`)` through the existing `onOpen` callback.

### Task 3: Refine Current Artifact, Version History, Traceability, and links

**Files:**
- Modify: `apps/web/src/features/evidence/evidence-detail.tsx`
- Modify: `apps/web/src/features/evidence/evidence-sheets.tsx`

**Interfaces:**
- Preserve `EvidenceDetailWorkspace` query keys and mutation invalidation.
- Preserve `AddVersionDialog`, `EditEvidenceSheet`, `LinkControlDialog`, and `LinkExecutionDialog` public props unless a type-only addition is required for current membership ownership.
- Preserve all existing API helper calls and archive restrictions.

- [ ] **Step 1: Strengthen the Current Artifact panel**

Use the existing `Artifact` component but rename its visible heading to `Current Artifact`. Keep the current type-specific body:

```tsx
evidence.type === "TEXT" ? <pre>...</pre>
  : evidence.type === "URL" ? <a ...>Open external URL</a>
  : <div>File download unavailable ...</div>
```

Expand the metadata definition list to include uploader (`version.uploadedBy?.name` when available, otherwise `evidence.createdBy?.name`), uploaded date, current version, file size, and checksum. Keep checksum truncation and copy action.

- [ ] **Step 2: Add supported artifact actions without inventing backend support**

Keep URL Open as an external link. Keep file action explanatory and disabled/informational because no secure download endpoint exists. Do not add a fake download URL or client-side filesystem access.

- [ ] **Step 3: Turn Version History into a restrained timeline/list**

Keep descending versions and current-first ordering. Each row must show:

```tsx
v{version.versionNumber}
{current ? "Current" : null}
versionFileLabel(version, type)
formatEvidenceDate(version.createdAt)
version.uploadedBy?.name ?? "Uploaded by organization member"
formatFileSize(version.fileSize)
shortenChecksum(version.checksum)
```

Use a border/divider and a small dot/line treatment only; no SVG, gradient, glow, or new motion.

- [ ] **Step 4: Make traceability and relationship distinctions explicit**

Keep the existing stacked `TraceRow` chain and clickable Control/Requirement routes. Keep Linked Controls and Control Executions as separate compact sections. Ensure execution rows show period label, status, and period dates, and control rows show code/title/status.

- [ ] **Step 5: Refine Add Version copy and action placement**

Keep Add Version beside Edit in the header. Retain this exact guidance in the dialog:

```text
A new version will be created. Previous versions will remain unchanged.
```

Do not use replacement or deletion language.

- [ ] **Step 6: Run focused Evidence lint**

```bash
pnpm --filter @risksphere/web exec eslint src/features/evidence/evidence-detail.tsx src/features/evidence/evidence-sheets.tsx
```

Expected: exit code 0.

### Task 4: Full verification and behavior review

**Files:**
- No additional source files unless verification exposes a scoped Evidence issue.

- [ ] **Step 1: Run frontend typecheck**

```bash
pnpm --filter @risksphere/web typecheck
```

Expected: TypeScript exits successfully.

- [ ] **Step 2: Run frontend lint**

```bash
pnpm --filter @risksphere/web lint
```

Expected: ESLint exits successfully.

- [ ] **Step 3: Run frontend production build**

```bash
pnpm --filter @risksphere/web build
```

Expected: build succeeds and includes `/evidence` and `/evidence/[evidenceId]`.

- [ ] **Step 4: Check final diff**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the approved Evidence UI files and the refinement spec/plan are changed. Runtime `apps/api/uploads/` remains untracked and excluded.

- [ ] **Step 5: Review behavior against the approved checklist**

Verify list loading, row navigation, artifact identity, Current Artifact metadata, version history, URL Open/file-download explanation, traceability links, separate Control/Execution rows, expiry colors, Add Version copy, and desktop/mobile layout without modifying unrelated modules.
