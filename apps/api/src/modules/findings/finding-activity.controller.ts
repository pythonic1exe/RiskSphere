import { Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingActivityService } from './finding-activity.service';

@ApiTags('Finding Activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/findings/:findingId/activity')
export class FindingActivityController {
  constructor(private readonly activities: FindingActivityService) {}

  @Get()
  @ApiOperation({ summary: 'List Finding activity history' })
  list(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string) {
    if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return this.activities.list(req.organizationAccess, findingId);
  }
}
