import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 15 * 60;
const DEFAULT_SECRET = 'pac-dev-only-secret-do-not-use-in-prod';
const MAX_RECEIPT_ID_LEN = 64;

function getSecret(): string {
  return process.env.RECIPE_TOKEN_SECRET || DEFAULT_SECRET;
}

function base64Url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, 'base64');
}

export interface RecipeTokenPayload {
  buyerId: string;
  clientReceiptId?: string;
  iat: number;
  exp: number;
}

export function signRecipeToken(buyerId: string, clientReceiptId?: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: RecipeTokenPayload = {
    buyerId,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  };
  if (clientReceiptId) {
    payload.clientReceiptId = clientReceiptId.slice(0, MAX_RECEIPT_ID_LEN);
  }
  const payloadEncoded = base64Url(JSON.stringify(payload));
  const sig = createHmac('sha256', getSecret()).update(payloadEncoded).digest();
  return `${payloadEncoded}.${base64Url(sig)}`;
}

export function verifyRecipeToken(token: string): RecipeTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadEncoded, sigEncoded] = parts;
  const expected = createHmac('sha256', getSecret()).update(payloadEncoded).digest();
  const provided = fromBase64Url(sigEncoded);
  if (expected.length !== provided.length) return null;
  if (!timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded).toString('utf8')) as RecipeTokenPayload;
    if (!payload.buyerId || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
