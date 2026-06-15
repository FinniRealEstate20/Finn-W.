import { randomBytes } from 'crypto';

// Crockford-style base32 minus the look-alike characters (0/O, 1/I/L).
// 31 symbols, mixed letters + digits, all caps so the code is unambiguous
// when read aloud by a broker over the phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
