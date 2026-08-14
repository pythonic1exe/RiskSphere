import { describe, expect, it } from 'vitest';
import { Buffer } from 'node:buffer';

import { MAX_EVIDENCE_FILE_SIZE, checksumFor, nextEvidenceVersion, safeEvidenceFileName, validateVersionPayload } from './evidence.utils';
import { EvidenceType } from '@prisma/client';

describe('Evidence invariants', () => {
  it('allocates the next append-only version number', () => {
    expect(nextEvidenceVersion([1, 3, 2])).toBe(4);
    expect(nextEvidenceVersion([])).toBe(1);
  });

  it('sanitizes filenames and prevents path traversal', () => {
    expect(safeEvidenceFileName('../../Board Minutes 2026.pdf')).toBe('Board-Minutes-2026.pdf');
    expect(safeEvidenceFileName('')).toBe('evidence.bin');
  });

  it('calculates SHA-256 checksums', () => {
    expect(checksumFor(Buffer.from('RiskSphere'))).toBe('1632c618bb1cd236fef45600af3305fe9120c7c02858caace0c03e485fc49ab1');
  });

  it('validates type-specific version payloads', () => {
    expect(() => validateVersionPayload(EvidenceType.FILE, { file: { size: MAX_EVIDENCE_FILE_SIZE + 1 } })).toThrow('25 MB');
    expect(() => validateVersionPayload(EvidenceType.URL, {})).toThrow('externalUrl');
    expect(() => validateVersionPayload(EvidenceType.TEXT, {})).toThrow('textContent');
    expect(() => validateVersionPayload(EvidenceType.SYSTEM_RECORD, {})).not.toThrow();
  });
});
