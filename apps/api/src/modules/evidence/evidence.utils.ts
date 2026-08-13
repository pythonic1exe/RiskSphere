import { BadRequestException } from '@nestjs/common';
import type { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { EvidenceType } from '@prisma/client';

export const MAX_EVIDENCE_FILE_SIZE = 25 * 1024 * 1024;

export function nextEvidenceVersion(existingVersions: number[]): number {
  return existingVersions.length ? Math.max(...existingVersions) + 1 : 1;
}

export function safeEvidenceFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop()?.trim() ?? '';
  const safeName = baseName
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
  return safeName || 'evidence.bin';
}

export function checksumFor(file: Buffer): string {
  return createHash('sha256').update(file).digest('hex');
}

export function validateVersionPayload(type: EvidenceType, payload: { file?: { size: number }; externalUrl?: string; textContent?: string }): void {
  if (type === EvidenceType.FILE) {
    if (!payload.file) throw new BadRequestException('A file is required for FILE evidence');
    if (payload.file.size > MAX_EVIDENCE_FILE_SIZE) throw new BadRequestException('Evidence files cannot exceed 25 MB');
    return;
  }
  if (payload.file) throw new BadRequestException(`${type} evidence cannot include a file`);
  if (type === EvidenceType.URL && !payload.externalUrl?.trim()) throw new BadRequestException('externalUrl is required for URL evidence');
  if (type === EvidenceType.TEXT && !payload.textContent?.trim()) throw new BadRequestException('textContent is required for TEXT evidence');
}
