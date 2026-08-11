import {
  CanActivate,
  ExecutionContext,
  ParseUUIDPipe,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { ArgumentMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../auth/auth.types';
import { ORGANIZATION_ROLES_KEY } from './organization-roles.decorator';
import { OrganizationAuthorizationService } from './organization-authorization.service';

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  private readonly organizationIdPipe = new ParseUUIDPipe();

  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: OrganizationAuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.authUser;

    if (!user) {
      throw new ForbiddenException('Authentication is required');
    }

    const organizationId = request.params?.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Missing organizationId route parameter');
    }

    await this.organizationIdPipe.transform(organizationId, {
      type: 'param',
      metatype: String,
      data: 'organizationId',
    } as ArgumentMetadata);

    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ORGANIZATION_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const access = await this.authorizationService.getAccess(user.userId, organizationId);
    request.organizationAccess = access;

    if (requiredRoles.length > 0 && !access.roleCodes.some((roleCode) => requiredRoles.includes(roleCode))) {
      throw new ForbiddenException('Insufficient organization role');
    }

    return true;
  }
}
