import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { ChangePasswordDto, UpdateNotificationPreferencesDto, UpdatePreferencesDto, UpdateProfileDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UserSettingsService } from './user-settings.service';

@ApiTags('User Profile', 'User Preferences', 'Notification Preferences', 'Security') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller()
export class UserSettingsController {
  constructor(private readonly settings: UserSettingsService) {}
  private user(req: AuthenticatedRequest) { if (!req.authUser) throw new InternalServerErrorException('Authenticated user missing'); return req.authUser; }
  @Get('users/me/profile') profile(@Req() req: AuthenticatedRequest) { return this.settings.profile(this.user(req).userId); }
  @ApiBody({ type: UpdateProfileDto }) @Patch('users/me/profile') updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) { return this.settings.updateProfile(this.user(req).userId, dto); }
  @Get('users/me/preferences') preferences(@Req() req: AuthenticatedRequest) { return this.settings.preferences(this.user(req).userId); }
  @ApiBody({ type: UpdatePreferencesDto }) @Patch('users/me/preferences') updatePreferences(@Req() req: AuthenticatedRequest, @Body() dto: UpdatePreferencesDto) { return this.settings.updatePreferences(this.user(req).userId, dto); }
  @Get('users/me/notification-preferences') notifications(@Req() req: AuthenticatedRequest) { return this.settings.notifications(this.user(req).userId); }
  @ApiBody({ type: UpdateNotificationPreferencesDto }) @Patch('users/me/notification-preferences') updateNotifications(@Req() req: AuthenticatedRequest, @Body() dto: UpdateNotificationPreferencesDto) { return this.settings.updateNotifications(this.user(req).userId, dto); }
  @ApiOperation({ summary: 'Change the authenticated user password' }) @ApiBody({ type: ChangePasswordDto }) @Post('users/me/change-password') changePassword(@Req() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) { const user = this.user(req); return this.settings.changePassword(user.userId, user.sessionId, dto); }
  @Get('users/me/sessions') sessions(@Req() req: AuthenticatedRequest) { const user = this.user(req); return this.settings.sessions(user.userId, user.sessionId); }
  @Post('users/me/sessions/revoke-others') revokeOthers(@Req() req: AuthenticatedRequest) { const user = this.user(req); return this.settings.revokeOthers(user.userId, user.sessionId); }
  @Delete('users/me/sessions/:sessionId') revokeSession(@Req() req: AuthenticatedRequest, @Param('sessionId') sessionId: string) { return this.settings.revokeSession(this.user(req).userId, sessionId); }
}
