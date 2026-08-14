import { Body, Controller, InternalServerErrorException, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { PromoteObservationDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingsService } from './findings.service';

@ApiTags('Finding Promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/audit-tests/:auditTestId/observations')
export class FindingPromotionsController {
  constructor(private readonly findings: FindingsService) {}

  @Post(':observationId/promote-to-finding')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Promote an Audit Test Observation to a Finding' })
  @ApiBody({ type: PromoteObservationDto })
  promote(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) auditTestId: string, @Param('observationId', new ParseUUIDPipe()) observationId: string, @Body() dto: PromoteObservationDto) {
    if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return this.findings.promoteObservation(req.organizationAccess, auditTestId, observationId, dto);
  }
}
