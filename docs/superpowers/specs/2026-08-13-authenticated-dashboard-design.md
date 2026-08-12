# RiskSphere Authenticated Dashboard Design

## Goal

Replace the placeholder authenticated workspace screen with the first RiskSphere dashboard shell and Home screen, using mock GRC data and preserving the existing authentication and onboarding route contract.

## Route Strategy

`/workspace` remains the canonical authenticated Home route. The current onboarding completion redirect and `getAuthenticatedDestination()` behavior already target `/workspace`; retaining it avoids breaking existing sessions and deep links. The page title and visible product language may refer to the dashboard, but no route rename is needed for this stage.

## Architecture

`WorkspaceHome` continues to own authenticated organization loading and redirect behavior. Once an active, completed organization is resolved, it renders a reusable `DashboardShell` with user and organization context.

The dashboard feature is split by responsibility:

- `DashboardShell`: authenticated application frame, responsive sidebar, header, and content region.
- `DashboardSidebar`: icon-first navigation grouped by product area. Hover/focus reveals only the active item label using the existing `motion/react` dependency.
- `DashboardHeader`: greeting, organization context, search affordance, notification affordance, and profile/logout control.
- Dashboard cards: small focused components for GRC overview, metrics, analytics, attention items, tasks, upcoming schedule, and recent activity.
- Dashboard mock data: typed local data kept separate from presentation so API integration can replace it later.

The sidebar links are presentational destinations for modules that are not implemented yet. `/workspace` is the only functional dashboard destination in this stage.

## Visual Direction

Use the established RiskSphere tokens in `globals.css`: dark base/app/card/elevated surfaces, subtle slate borders, blue primary, cyan accent, and existing Inter, Space Grotesk, and Orbitron font roles. Cards use restrained 10-14px radius, low-contrast borders, and no heavy shadows or decorative gradients.

The Home screen uses an asymmetric CSS grid:

1. Large GRC overview beside compact KPI cards.
2. Main analytics/progress card beside Attention Required.
3. My Tasks beside Upcoming.
4. Full-width Recent Activity.

The grid collapses cleanly on smaller screens. The sidebar stays compact on desktop and becomes a horizontal/stacked mobile navigation pattern that does not cause content overflow.

## Interaction and Accessibility

Navigation items are links with visible active state, keyboard focus state, and accessible labels when collapsed. Hover/focus animation changes item width, label opacity, and a small horizontal offset; it does not expand the entire sidebar. `prefers-reduced-motion` is respected through `useReducedMotion()`.

Header controls are accessible buttons with labels. Mock rows remain semantic lists where appropriate. Navigation destinations that are not implemented yet should not pretend to load real data.

## Data and Error Handling

Organization loading and redirect behavior remain unchanged. The loading state stays within the existing protected workspace flow. Dashboard content uses typed mock data only and has no API failure path. Organization name comes from the resolved organization and the greeting uses the authenticated user when available, with safe mock-friendly fallbacks.

## Verification

- Add focused component tests if the repository has a suitable frontend test harness; otherwise verify behavior through typecheck and production build.
- Run `pnpm --filter @risksphere/web typecheck`.
- Run `pnpm --filter @risksphere/web build`.
- Confirm onboarding/auth destination code still resolves completed organizations to `/workspace`.

## Out Of Scope

- Dashboard APIs or real-time data.
- RBAC-specific navigation or dashboards.
- Implementing the Risks, Controls, Compliance, Evidence, Audits, Findings, Tasks, Organization, or Settings pages.
- Renaming or removing `/workspace`.
