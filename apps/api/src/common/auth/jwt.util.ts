import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import type { JwtTokenPayload } from './auth.types';

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
}

export function generateTokenId(): string {
  return randomUUID();
}

export function parseDurationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number.parseInt(match[1] ?? '0', 10);
  const unit = match[2]?.toLowerCase();

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      throw new Error(`Unsupported duration format: ${value}`);
  }
}

export function signJwt(
  payload: Omit<JwtTokenPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string,
): string {
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + parseDurationToSeconds(expiresIn);
  const jwtPayload: JwtTokenPayload = { ...payload, iat, exp };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(unsignedToken).digest();
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

export function verifyJwt(token: string, secret: string): JwtTokenPayload {
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid JWT format');
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(
    createHmac('sha256', secret).update(unsignedToken).digest(),
  );
  const providedSignature = base64UrlDecode(encodedSignature);
  const signatureBuffer = base64UrlDecode(expectedSignature);

  if (
    providedSignature.length !== signatureBuffer.length ||
    !timingSafeEqual(providedSignature, signatureBuffer)
  ) {
    throw new Error('Invalid JWT signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as JwtTokenPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error('JWT expired');
  }

  return payload;
}
