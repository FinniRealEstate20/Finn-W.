import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Symmetric encryption helpers for PII columns (IBAN, Steuer-ID, phone,
 * birth date). Format: `v<n>:<base64-iv>:<base64-tag>:<base64-ciphertext>`.
 *
 * - AES-256-GCM, 12-byte IV, 16-byte auth tag.
 * - Key versioning: blobs remember which key encrypted them, so we can
 *   add DATA_ENCRYPTION_KEY_V2 and rotate without touching old rows.
 * - Active version (used for new encryptions) comes from
 *   DATA_ENCRYPTION_ACTIVE_VERSION.
 */

const ACTIVE_VERSION = parseInt(
  process.env.DATA_ENCRYPTION_ACTIVE_VERSION ?? '1',
  10
);

function keyFor(version: number): Buffer {
  const raw = process.env[`DATA_ENCRYPTION_KEY_V${version}`];
  if (!raw) {
    throw new Error(`DATA_ENCRYPTION_KEY_V${version} is not configured`);
  }
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) {
    throw new Error(
      `DATA_ENCRYPTION_KEY_V${version} must decode to 32 bytes (got ${buf.length})`
    );
  }
  return buf;
}

export function encryptPII(plain: string | null | undefined): string | null {
  if (plain == null || plain === '') return null;
  const key = keyFor(ACTIVE_VERSION);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    `v${ACTIVE_VERSION}`,
    iv.toString('base64'),
    tag.toString('base64'),
    ct.toString('base64'),
  ].join(':');
}

export function decryptPII(blob: string | null | undefined): string | null {
  if (!blob) return null;
  const parts = blob.split(':');
  if (parts.length !== 4 || !parts[0].startsWith('v')) {
    throw new Error('Malformed ciphertext blob');
  }
  const version = parseInt(parts[0].slice(1), 10);
  const key = keyFor(version);
  const iv = Buffer.from(parts[1], 'base64');
  const tag = Buffer.from(parts[2], 'base64');
  const ct = Buffer.from(parts[3], 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

export function activeKeyVersion(): number {
  return ACTIVE_VERSION;
}

/** Reveal only the last N characters; used in audit-log entries. */
export function redactTrailing(plain: string | null | undefined, keep = 4): string {
  if (!plain) return '';
  if (plain.length <= keep) return '*'.repeat(plain.length);
  return '*'.repeat(plain.length - keep) + plain.slice(-keep);
}
