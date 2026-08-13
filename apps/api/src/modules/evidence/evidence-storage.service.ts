import { Injectable } from '@nestjs/common';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ConfigService } from '@nestjs/config';
import type { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { safeEvidenceFileName } from './evidence.utils';

export const EVIDENCE_STORAGE_SERVICE = Symbol('EVIDENCE_STORAGE_SERVICE');

export interface EvidenceStorageService {
  save(organizationId: string, evidenceId: string, versionNumber: number, fileName: string, file: Buffer): Promise<{ storageKey: string; fileSize: number; checksum: string }>;
}

@Injectable()
export class LocalEvidenceStorageService implements EvidenceStorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = config.get<string>('EVIDENCE_STORAGE_ROOT') ?? join(process.cwd(), 'uploads');
  }

  async save(organizationId: string, evidenceId: string, versionNumber: number, fileName: string, file: Buffer) {
    const safeName = safeEvidenceFileName(fileName);
    const storageKey = `organizations/${organizationId}/evidence/${evidenceId}/v${versionNumber}/${safeName}`;
    const absolutePath = join(this.root, ...storageKey.split('/'));
    await mkdir(join(this.root, ...storageKey.split('/').slice(0, -1)), { recursive: true });
    await writeFile(absolutePath, file, { flag: 'wx' });
    return { storageKey, fileSize: file.length, checksum: createHash('sha256').update(file).digest('hex') };
  }
}
