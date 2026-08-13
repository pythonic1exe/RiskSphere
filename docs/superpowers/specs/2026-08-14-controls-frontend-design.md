# Controls Frontend Design

## Direction

Build Controls as a focused sibling feature under `apps/web/src/features/controls`, using the existing authenticated dashboard shell, RiskSphere tokens, Risks interaction patterns, API client, TanStack Query, sheets, dialogs, skeletons, and pagination. Do not create a parallel design system or modify the backend.

## Screens and data flow

- `/controls` provides the URL-synchronized Control Register with search, status/type/frequency/owner filters, additional automation/risk filters, sorting, pagination, summary strip, empty states, and a New Control sheet.
- `/controls/[controlId]` provides Overview, Executions, and Risks tabs. Control lifecycle actions live in the existing overflow-menu pattern; executions use a side drawer with contextual lifecycle actions; linked risks use searchable selection and navigate to existing Risk detail routes.
- Risk Detail gains a Controls tab and uses the same RiskControl relationship APIs, with links/unlinks invalidating both risk and control queries.
- Control and execution mutations invalidate the relevant list/detail query keys and navigate to the created entity where appropriate.

## Contract decisions

- Control codes are displayed from the backend and never generated in the frontend.
- Backend-derived `isOverdue` is displayed as secondary due-date context, not as a lifecycle status.
- Owner/assignee selectors use the current membership when no member-directory endpoint is available; no new backend endpoint is introduced.
- Risk selection uses the existing paginated Risk search API and excludes already-linked records.

## Visual and interaction rules

Use the existing dark RiskSphere palette and typography. Keep the register table dense, summary information in one horizontal strip, and detail pages operational rather than analytical. Reuse existing button, input, tabs, sheet, dialog, skeleton, and pagination primitives. Provide intentional loading, empty, error, and confirmation states without decorative charts or redundant cards.

## Verification

Run web typecheck, focused lint for the new feature and modified Risk files, production build, and manual browser checks for register navigation, query filters, create/edit flows, lifecycle actions, execution transitions, risk linking, and Risk Detail Controls tab.
