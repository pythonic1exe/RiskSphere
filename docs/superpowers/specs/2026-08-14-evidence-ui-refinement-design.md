# Evidence UI Refinement Design

## Goal

Refine the existing Evidence register and detail workspace so it remains consistent with the RiskSphere Risks and Controls modules while making artifact identity, immutable versions, traceability, and expiry more prominent.

## Scope

Only Evidence UI components and Evidence formatting helpers change. The global shell, navigation, typography tokens, table/filter/pagination patterns, Risks, Controls, Compliance, backend APIs, and backend download support remain unchanged.

## Design

### Evidence register

Keep the current desktop table and responsive mobile rows. The primary Evidence cell will show the logical title first and the underlying filename or URL in muted text beneath it when available. Version numbers will use a clear `vN` treatment. Existing Evidence-specific columns remain: Type, Linked Control, Owner, Version, Expiry, and Status.

Expiry presentation will use muted styling for normal dates, amber for records expiring within 30 days, and red for expired records. The existing client-side expiring-soon derivation remains the source of the amber state.

### Evidence detail

The current artifact panel will be presented as `Current Artifact` and prioritize artifact metadata over generic record metadata. It will show filename, URL, or text identity; Evidence type; file size where available; current version; uploader; upload date; SHA-256 checksum with truncation and copy behavior; and supported Open/Download behavior. File download remains informational because no secure backend download endpoint exists.

Version History will remain descending and immutable, but use a restrained vertical timeline/list. Each entry will show version number, current marker, filename or artifact label, uploader, upload date, file size, checksum, and supported Open/Download behavior. No gradients, glow, SVG decoration, or new animation system will be introduced.

Traceability will retain the existing Requirement → Control → Control Execution → Evidence relationship. Existing routes remain clickable where available. Linked Controls and Linked Control Executions remain separate sections with compact rows that emphasize the distinction between a control requirement, a specific execution, and evidence proving the execution.

### Interaction and states

Add Version remains a first-class action near Edit. Copy should explicitly state that a new version is created and previous versions remain unchanged. Existing inline mutation feedback, archive restrictions, query invalidation, responsive behavior, and dialog/sheet flows remain intact.

## Verification

Run frontend typecheck, Evidence-file lint, frontend build, `git diff --check`, and inspect the resulting list/detail behavior for navigation, artifact metadata, version history, traceability, links, expiry states, Add Version, and responsive layouts.
