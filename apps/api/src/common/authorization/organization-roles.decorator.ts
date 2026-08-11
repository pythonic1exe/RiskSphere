import { SetMetadata } from '@nestjs/common';

import type { OrganizationRoleCode } from '../auth/auth.constants';

export const ORGANIZATION_ROLES_KEY = 'organization-roles';

export const OrganizationRoles = (...roles: OrganizationRoleCode[]) =>
  SetMetadata(ORGANIZATION_ROLES_KEY, roles);

