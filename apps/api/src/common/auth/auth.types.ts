import type { Membership, Organization, Role, User } from '@prisma/client';

import type { OrganizationRoleCode } from './auth.constants';

export interface JwtTokenPayload {
  sub: string;
  sid: string;
  typ: 'access' | 'refresh';
  jti?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  sessionId: string;
}

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
}

export interface OrganizationAccess {
  organization: Organization;
  membership: Membership;
  roles: Role[];
  roleCodes: OrganizationRoleCode[];
}

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  authUser?: AuthenticatedUser;
  currentUser?: AuthenticatedRequestUser;
  organizationAccess?: OrganizationAccess;
  params?: Record<string, string>;
}
