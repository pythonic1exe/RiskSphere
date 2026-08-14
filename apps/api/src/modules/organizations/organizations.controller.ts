import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import { OrganizationsService } from './organizations.service';
import {
  CompleteOnboardingResponseDto,
  CreateOrganizationDto,
  CreateOrganizationResponseDto,
  OrganizationOnboardingResponseDto,
  MyOrganizationsResponseDto,
  UpdateOnboardingProgressDto,
  UpdateOnboardingProgressResponseDto,
  UpdateOrganizationDto,
  UpdateOrganizationResponseDto,
} from './dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List organizations for the authenticated user' })
  @ApiOkResponse({ type: MyOrganizationsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  getMyOrganizations(@Req() request: AuthenticatedRequest) {
    if (!request.authUser) {
      throw new InternalServerErrorException('Authenticated user missing');
    }

    return this.organizationsService.getMyOrganizations(request.authUser.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new organization and initialize onboarding' })
  @ApiBody({ type: CreateOrganizationDto })
  @ApiCreatedResponse({ type: CreateOrganizationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiConflictResponse({ description: 'Organization slug already exists' })
  @UseGuards(JwtAuthGuard)
  @Post()
  createOrganization(@Req() request: AuthenticatedRequest, @Body() dto: CreateOrganizationDto) {
    if (!request.authUser) {
      throw new InternalServerErrorException('Authenticated user missing');
    }

    return this.organizationsService.createOrganization(request.authUser.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get onboarding state for an organization' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationOnboardingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'User is not a member of this organization' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @Get(':organizationId/onboarding')
  getOnboarding(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.organizationsService.getOnboarding(request.organizationAccess);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active organization members for tenant-scoped selectors' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @Get(':organizationId/members')
  listMembers(@Req() request: AuthenticatedRequest) {
    if (!request.organizationAccess)
      throw new InternalServerErrorException('Organization access missing');
    return this.organizationsService.listActiveMembers(request.organizationAccess);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update organization metadata and defaults' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiBody({ type: UpdateOrganizationDto })
  @ApiOkResponse({ type: UpdateOrganizationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @ApiConflictResponse({ description: 'Organization slug already exists' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @Patch(':organizationId')
  updateOrganization(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateOrganizationDto,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.organizationsService.updateOrganization(request.organizationAccess, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update onboarding resume metadata' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiBody({ type: UpdateOnboardingProgressDto })
  @ApiOkResponse({ type: UpdateOnboardingProgressResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @Patch(':organizationId/onboarding')
  updateOnboardingProgress(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateOnboardingProgressDto,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.organizationsService.updateOnboardingProgress(request.organizationAccess, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark onboarding complete and activate the organization' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiOkResponse({ type: CompleteOnboardingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post(':organizationId/onboarding/complete')
  completeOnboarding(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.organizationsService.completeOnboarding(request.organizationAccess);
  }
}
