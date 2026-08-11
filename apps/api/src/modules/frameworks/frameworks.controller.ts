import {
  Controller,
  Delete,
  Get,
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
  ApiForbiddenResponse,
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
import { FrameworksService } from './frameworks.service';
import { FrameworkCatalogResponseDto, FrameworkSelectionResponseDto } from './dto';

@ApiTags('Frameworks')
@Controller()
export class FrameworksController {
  constructor(private readonly frameworksService: FrameworksService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the global framework catalog' })
  @ApiOkResponse({ type: FrameworkCatalogResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @UseGuards(JwtAuthGuard)
  @Get('framework-catalog')
  getCatalog() {
    return this.frameworksService.getCatalog();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Select a framework for the organization' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiParam({ name: 'frameworkCatalogId', format: 'uuid' })
  @ApiOkResponse({ type: FrameworkSelectionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @HttpCode(200)
  @Post('organizations/:organizationId/framework-selections/:frameworkCatalogId')
  selectFramework(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
    @Param('frameworkCatalogId', new ParseUUIDPipe()) frameworkCatalogId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.frameworksService.selectFramework(request.organizationAccess, frameworkCatalogId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a framework selection from the organization' })
  @ApiParam({ name: 'organizationId', format: 'uuid' })
  @ApiParam({ name: 'frameworkCatalogId', format: 'uuid' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Requires OWNER or GRC_ADMIN role' })
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN)
  @Delete('organizations/:organizationId/framework-selections/:frameworkCatalogId')
  unselectFramework(
    @Req() request: AuthenticatedRequest,
    @Param('organizationId', new ParseUUIDPipe()) _organizationId: string,
    @Param('frameworkCatalogId', new ParseUUIDPipe()) frameworkCatalogId: string,
  ) {
    if (!request.organizationAccess) {
      throw new InternalServerErrorException('Organization access missing');
    }

    return this.frameworksService.unselectFramework(request.organizationAccess, frameworkCatalogId);
  }
}
