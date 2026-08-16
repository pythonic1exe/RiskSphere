# Audit Under Review Panel Refinement

## Scope

Refine the existing audit detail header without changing its information architecture, data flow, or interactions.

## Design

- Wrap the audit title/info, lifecycle, and action area in a restrained elevated dark panel.
- Use `#111827` for the panel, `#263244` for the border, a 10–12px radius, and a 3px `#F59E0B` left accent while the audit is `UNDER_REVIEW`.
- Render the lifecycle status as a compact amber dot/badge rather than a large pill.
- Keep lifecycle state amber, use `#3B82F6` for test progress, and use `#1E293B` for the progress track.
- Preserve the current responsive layout and add separators only where they improve grouping without restructuring the header.

## Verification

Run the affected frontend typecheck or build and inspect the diff to confirm no audit behavior or unrelated UI changes were introduced.
