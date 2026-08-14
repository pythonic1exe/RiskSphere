import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { CreateFindingValidationDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingValidationsService } from './finding-validations.service';

@ApiTags('Finding Validations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/findings/:findingId/validations')
export class FindingValidationsController {
  constructor(private readonly validations: FindingValidationsService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }

  @Get() list(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string) { return this.validations.list(this.access(req), findingId); }
  @Post() @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Record Finding validation' }) @ApiBody({ type: CreateFindingValidationDto }) create(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Body() dto: CreateFindingValidationDto) { return this.validations.create(this.access(req), findingId, dto); }
}
