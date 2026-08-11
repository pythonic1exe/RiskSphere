import {
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  HttpCode,
  Param,
  Post,
  Req,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import { InvitationsService } from './invitations.service';
import {
  AcceptInvitationDto,
  AcceptInvitationResponseDto,
  CreateInvitationDto,
  CreateInvitationResponseDto,
  RevokeInvitationResponseDto,
} from './dto';

@ApiTags('Invitations')
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an invitation for a user in the organization' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiBody({ type: CreateInvitationDto })
  @ApiCreatedResponse({ type: CreateInvitationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiConflictResponse({ description: 'An active invitation already exists for this email' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @Post('organizations/:organizationId/invitations')
  createInvitation(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateInvitationDto,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.invitationsService.createInvitation(request.organizationAccess, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiParam({ name: 'invitationId', format: 'uuid' })
  @ApiOkResponse({ type: RevokeInvitationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @ApiNotFoundResponse({ description: 'Invitation not found' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @HttpCode(200)
  @Delete('organizations/:organizationId/invitations/:invitationId')
  revokeInvitation(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
    @Param('invitationId', new ParseUUIDPipe()) invitationId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.invitationsService.revokeInvitation(request.organizationAccess, invitationId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an invitation using the authenticated account' })
  @ApiBody({ type: AcceptInvitationDto })
  @ApiOkResponse({ type: AcceptInvitationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Invitation email does not match the authenticated user' })
  @ApiNotFoundResponse({ description: 'Invitation not found' })
  @ApiConflictResponse({ description: 'Invitation already consumed, revoked, or expired' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('organization-invitations/accept')
  acceptInvitation(
    @Req() request: AuthenticatedRequest,
    @Body() dto: AcceptInvitationDto,
  ) {
    if (!request.currentUser) {
      throw new InternalServerErrorException('Current user missing');
    }

    return this.invitationsService.acceptInvitation(request.currentUser.id, request.currentUser.email, dto);
  }
}
