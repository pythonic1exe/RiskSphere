import { randomBytes, scryptSync } from 'node:crypto';
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;

function toBase64Url(input: Buffer): string {
  return input.toString('base64url');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  }) as Buffer;

  return [
    'scrypt',
    SCRYPT_N.toString(10),
    SCRYPT_R.toString(10),
    SCRYPT_P.toString(10),
    toBase64Url(salt),
    toBase64Url(derivedKey),
  ].join('$');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, nValue, rValue, pValue, saltValue, hashValue] = storedHash.split('$');

  if (algorithm !== 'scrypt' || !nValue || !rValue || !pValue || !saltValue || !hashValue) {
    return false;
  }

  const salt = Buffer.from(saltValue, 'base64url');
  const expectedHash = Buffer.from(hashValue, 'base64url');
  const derivedKey = scryptSync(password, salt, expectedHash.length, {
    N: Number.parseInt(nValue, 10),
    r: Number.parseInt(rValue, 10),
    p: Number.parseInt(pValue, 10),
  }) as Buffer;

  return expectedHash.length === derivedKey.length && expectedHash.equals(derivedKey);
}
