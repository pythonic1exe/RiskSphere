# RiskSphere Dashboard Composition Redesign

## Goal

Substantially redesign the existing authenticated RiskSphere Home dashboard so it reads as one composed enterprise workspace instead of a collection of repeated admin-template cards.

## Scope

Change only the authenticated dashboard shell, sidebar treatment, and Home dashboard presentation. Preserve the existing `/workspace` route, authentication, onboarding, mock GRC content, fonts, color tokens, and module navigation. Do not change backend code, APIs, RBAC, database models, landing pages, or unrelated routes.

## Composition

Use a workspace-canvas layout with a clear visual center:

1. A confident `Dashboard` heading and organization overview sentence.
2. A large two-column hero surface: simplified GRC overview on the left and one dominant readiness trend visualization on the right.
3. A second composition row with My Tasks as the primary operational surface and Attention Required as a supporting action surface.
4. A lighter lower row for Upcoming and Recent Activity.

Avoid a four-card KPI row. Integrate Active risks, Compliance coverage, Active audits, and Open findings into compact supporting stats inside the hero or adjacent content rather than rendering repetitive standalone cards.

## Visual Language

Continue the RiskSphere dark palette and existing font roles. Use tonal layering between `bg-base`, `bg-app`, `bg-card`, and `bg-elevated`; reduce visible borders and reserve them for meaningful separation. Major surfaces may use 16-18px radius with softer internal spacing. Remove most uppercase eyebrow labels, repeated action links, colored icon circles, and generic chart decorations.

The readiness percentage is the visual anchor of the overview. Replace the current donut-plus-progress-bar widget with strong typography and quiet segmented/linear indicators. Replace the current bar chart with one restrained smooth trend visualization using the existing mock data and no new dependency.

## Sidebar

Keep all existing navigation destinations. Simplify grouping labels, use a vertically balanced compact rail, and preserve icon-first behavior. Only the hovered or keyboard-focused item expands horizontally to reveal its label on the right, using quick width/opacity/x motion and reduced-motion support. The rail must not expand globally or resize the main content.

## Content

Retain GRC concepts and mock values for readiness, controls, compliance, evidence, audit readiness, active risks, audits/findings, tasks, attention items, upcoming schedule, and recent activity. Vary surface treatments between sections so the page feels intentionally composed while remaining scannable and enterprise-appropriate.

## Responsive Behavior

Desktop/laptop composition is primary. At smaller widths, stack the hero columns and lower sections, keep the mobile navigation usable, resize the trend visualization, and prevent horizontal overflow.

## Verification

Run web typecheck, production build, focused lint for changed dashboard files, and `git diff --check`. Confirm `/workspace` remains generated and auth/onboarding routing files are unchanged.
