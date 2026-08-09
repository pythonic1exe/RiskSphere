# RiskSphere

RiskSphere is a multi-tenant Governance, Risk, Compliance, and Audit management platform.

## Architecture

```text
Next.js
   ↓ REST
NestJS
   ↓
Prisma
   ↓
PostgreSQL
```

## Multi-Tenancy

The planned tenancy model is:

```text
Shared PostgreSQL database
+
Shared schema
+
organizationId on tenant-owned records
+
tenant isolation enforced by NestJS
```

## Major Technologies

- Next.js
- NestJS
- PostgreSQL
- Prisma
- JWT
- Zod
- TanStack Query
- Swagger
- SendGrid
- Groq

JWT authentication, RBAC, SendGrid, Groq, and the business modules are planned for later phases and
are not implemented in this initialization pass.

## Prerequisites

- Node.js
- pnpm
- PostgreSQL

## Installation

```bash
pnpm install
```

## Environment Setup

Create app-specific `.env` files from the examples:

- `apps/api/.env`
- `apps/web/.env`

The backend expects `DATABASE_URL` and the planned auth/email/AI variables described in the example
files. The frontend expects `NEXT_PUBLIC_API_BASE_URL`.

## Development Commands

```bash
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm build
pnpm lint
pnpm typecheck
```

## Project Structure

```text
apps/
  web/
  api/
packages/
  shared-types/
  eslint-config/
  tsconfig/
```

## Next Recommended Implementation Step

Authentication + Organization Onboarding Foundation

That future phase will cover:

```text
Organization
→ initial administrator
→ invitation/account setup
→ email verification
→ login
→ JWT access token
→ refresh-token rotation
→ active tenant context
```
