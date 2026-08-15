import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from '../../common/auth/password.util';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { ChangePasswordDto, UpdateNotificationPreferencesDto, UpdatePreferencesDto, UpdateProfileDto } from './dto';

const DEFAULT_PREFERENCES = { timezone: null, dateFormat: 'DD/MM/YYYY', startPage: '/workspace', density: 'COMFORTABLE' as const };

@Injectable()
export class UserSettingsService {
  constructor(private readonly prisma: PrismaService) {}
  async profile(userId: string) { const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, status: true, displayName: true, jobTitle: true, createdAt: true, updatedAt: true } }); if (!user) throw new NotFoundException('User not found'); return user; }
  async updateProfile(userId: string, dto: UpdateProfileDto) { await this.assertUser(userId); return this.prisma.user.update({ where: { id: userId }, data: { ...(dto.displayName !== undefined ? { displayName: dto.displayName?.trim() || null } : {}), ...(dto.jobTitle !== undefined ? { jobTitle: dto.jobTitle?.trim() || null } : {}) }, select: { id: true, email: true, status: true, displayName: true, jobTitle: true, createdAt: true, updatedAt: true } }); }
  async preferences(userId: string) { const value = await this.prisma.userPreference.findUnique({ where: { userId } }); return value ? { timezone: value.timezone, dateFormat: value.dateFormat, startPage: value.startPage, density: value.density } : DEFAULT_PREFERENCES; }
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) { await this.assertUser(userId); if (dto.timezone) this.assertTimezone(dto.timezone); const value = await this.prisma.userPreference.upsert({ where: { userId }, create: { id: randomUUID(), userId, ...DEFAULT_PREFERENCES, ...dto }, update: dto }); return { timezone: value.timezone, dateFormat: value.dateFormat, startPage: value.startPage, density: value.density }; }
  async notifications(userId: string) { const value = await this.prisma.notificationPreference.findUnique({ where: { userId } }); return value ? { inAppEnabled: value.inAppEnabled, emailEnabled: value.emailEnabled } : { inAppEnabled: true, emailEnabled: true }; }
  async updateNotifications(userId: string, dto: UpdateNotificationPreferencesDto) { await this.assertUser(userId); const value = await this.prisma.notificationPreference.upsert({ where: { userId }, create: { id: randomUUID(), userId, inAppEnabled: dto.inAppEnabled ?? true, emailEnabled: dto.emailEnabled ?? true }, update: dto }); return { inAppEnabled: value.inAppEnabled, emailEnabled: value.emailEnabled }; }
  async changePassword(userId: string, sessionId: string, dto: ChangePasswordDto) { const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, passwordHash: true } }); if (!user) throw new UnauthorizedException('User not found'); if (!(await verifyPassword(dto.currentPassword, user.passwordHash))) throw new ConflictException('INVALID_CURRENT_PASSWORD'); if (dto.currentPassword === dto.newPassword) throw new ConflictException('NEW_PASSWORD_MUST_DIFFER'); const passwordHash = await hashPassword(dto.newPassword); await this.prisma.$transaction([this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }), this.prisma.session.updateMany({ where: { userId, id: { not: sessionId }, status: 'ACTIVE' }, data: { status: 'REVOKED', revokedAt: new Date() } })]); return { success: true } }
  async sessions(userId: string, currentSessionId: string) { const sessions = await this.prisma.session.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, select: { id: true, status: true, expiresAt: true, createdAt: true, updatedAt: true } }); return { data: sessions.map((session) => ({ ...session, currentSession: session.id === currentSessionId })) }; }
  async revokeSession(userId: string, sessionId: string) { const result = await this.prisma.session.updateMany({ where: { id: sessionId, userId, status: 'ACTIVE' }, data: { status: 'REVOKED', revokedAt: new Date() } }); if (!result.count) throw new NotFoundException('Session not found'); return { success: true }; }
  async revokeOthers(userId: string, currentSessionId: string) { const result = await this.prisma.session.updateMany({ where: { userId, id: { not: currentSessionId }, status: 'ACTIVE' }, data: { status: 'REVOKED', revokedAt: new Date() } }); return { success: true, revoked: result.count }; }
  private async assertUser(userId: string) { if (!(await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }))) throw new NotFoundException('User not found'); }
  private assertTimezone(timezone: string) { try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(); } catch { throw new ConflictException('INVALID_TIMEZONE'); } }
}
