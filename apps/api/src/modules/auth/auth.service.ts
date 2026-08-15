import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, type User } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';

import { PrismaService } from '../../database/prisma.service';
import {
  ACCESS_TOKEN_TYPE,
  REFRESH_TOKEN_TYPE,
} from '../../common/auth/auth.constants';
import type { AuthenticatedUser } from '../../common/auth/auth.types';
import { generateTokenId, signJwt, verifyJwt } from '../../common/auth/jwt.util';
import { hashPassword, verifyPassword } from '../../common/auth/password.util';
import type { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: Date;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = normalizeEmail(dto.email);

    const passwordHash = await hashPassword(dto.password);

    let user: User;
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }

    const tokens = await this.createSession(user);

    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = normalizeEmail(dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.createSession(user);

    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = this.verifyRefreshToken(dto.refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid session');
    }

    if (
      session.status !== 'ACTIVE' ||
      session.expiresAt.getTime() <= Date.now() ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException('Session expired');
    }

    if (session.refreshTokenHash !== hashToken(dto.refreshToken)) {
      throw new UnauthorizedException('Refresh token has been rotated');
    }

    const nextTokens = await this.rotateSession(session);
    return {
      user: this.toUserResponse(session.user),
      tokens: nextTokens,
    };
  }

  async logout(sessionId: string, userId: string) {
    await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is disabled');
    }

    return this.toUserResponse(user);
  }

  validateAccessToken(accessToken: string): AuthenticatedUser {
    const payload = this.verifyAccessToken(accessToken);
    return {
      userId: payload.sub,
      sessionId: payload.sid,
      email: '',
    };
  }

  private toUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      jobTitle: user.jobTitle,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async createSession(user: User): Promise<AuthTokens> {
    const refreshJti = generateTokenId();
    const accessJti = generateTokenId();
    const refreshToken = signJwt(
      {
        sub: user.id,
        sid: generateTokenId(),
        jti: refreshJti,
        typ: REFRESH_TOKEN_TYPE,
      },
      this.getRequiredJwtRefreshSecret(),
      this.getJwtRefreshExpiresIn(),
    );
    const payload = this.verifyRefreshToken(refreshToken);
    const refreshExpiresAt = new Date(payload.exp * 1000);

    await this.prisma.session.create({
      data: {
        id: payload.sid,
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        status: 'ACTIVE',
        expiresAt: refreshExpiresAt,
      },
    });

    const accessToken = signJwt(
      {
        sub: user.id,
        sid: payload.sid,
        jti: accessJti,
        typ: ACCESS_TOKEN_TYPE,
      },
      this.getRequiredJwtAccessSecret(),
      this.getJwtAccessExpiresIn(),
    );

    return {
      accessToken,
      refreshToken,
      sessionExpiresAt: refreshExpiresAt,
    };
  }

  private async rotateSession(session: { id: string; user: User }): Promise<AuthTokens> {
    const refreshJti = generateTokenId();
    const accessJti = generateTokenId();
    const refreshToken = signJwt(
      {
        sub: session.user.id,
        sid: session.id,
        jti: refreshJti,
        typ: REFRESH_TOKEN_TYPE,
      },
      this.getRequiredJwtRefreshSecret(),
      this.getJwtRefreshExpiresIn(),
    );

    const refreshPayload = this.verifyRefreshToken(refreshToken);
    const refreshExpiresAt = new Date(refreshPayload.exp * 1000);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
        status: 'ACTIVE',
        revokedAt: null,
      },
    });

    const accessToken = signJwt(
      {
        sub: session.user.id,
        sid: session.id,
        jti: accessJti,
        typ: ACCESS_TOKEN_TYPE,
      },
      this.getRequiredJwtAccessSecret(),
      this.getJwtAccessExpiresIn(),
    );

    return {
      accessToken,
      refreshToken,
      sessionExpiresAt: refreshExpiresAt,
    };
  }

  private verifyAccessToken(token: string) {
    let payload;
    try {
      payload = verifyJwt(token, this.getRequiredJwtAccessSecret());
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.typ !== ACCESS_TOKEN_TYPE) {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  private verifyRefreshToken(token: string) {
    let payload;
    try {
      payload = verifyJwt(token, this.getRequiredJwtRefreshSecret());
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.typ !== REFRESH_TOKEN_TYPE) {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  private getRequiredJwtAccessSecret(): string {
    const secret = this.configService.get<string>('app.jwtAccessSecret') ?? '';
    if (!secret) {
      throw new InternalServerErrorException('JWT access secret is not configured');
    }
    return secret;
  }

  private getRequiredJwtRefreshSecret(): string {
    const secret = this.configService.get<string>('app.jwtRefreshSecret') ?? '';
    if (!secret) {
      throw new InternalServerErrorException('JWT refresh secret is not configured');
    }
    return secret;
  }

  private getJwtAccessExpiresIn(): string {
    return this.configService.get<string>('app.jwtAccessExpiresIn') ?? '15m';
  }

  private getJwtRefreshExpiresIn(): string {
    return this.configService.get<string>('app.jwtRefreshExpiresIn') ?? '7d';
  }
}
