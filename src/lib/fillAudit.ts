export type FillSource = 'recipe' | 'ai' | 'failed';

export interface FillAuditEntry {
  label: string;
  profileKey: string;
  value: string;
  selector: string;
  source: FillSource;
  occurredAt: string;
}

export interface FillSummary {
  filled: number;
  missingRequired: number;
  aiAssisted: number;
  total: number;
}

const SENSITIVE_KEYS = new Set(['iban', 'steuerId']);

export function redactValue(profileKey: string, value: string): string {
  if (!value) return value;
  if (!SENSITIVE_KEYS.has(profileKey)) return value;
  const compact = value.replace(/\s+/g, '');
  if (compact.length <= 6) return '•••';
  const head = compact.slice(0, 4);
  const tail = compact.slice(-2);
  return `${head} ••• ${tail}`;
}

const MAX_ENTRIES = 30;
const MAX_VALUE_LEN = 200;
const MAX_SELECTOR_LEN = 240;
const MAX_LABEL_LEN = 80;
const MAX_KEY_LEN = 64;
const VALID_SOURCES: ReadonlySet<FillSource> = new Set(['recipe', 'ai', 'failed']);

export function sanitizeFillAudit(input: unknown): FillAuditEntry[] {
  if (!Array.isArray(input)) return [];
  const out: FillAuditEntry[] = [];
  for (const raw of input.slice(0, MAX_ENTRIES)) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const source = typeof r.source === 'string' && VALID_SOURCES.has(r.source as FillSource)
      ? (r.source as FillSource)
      : 'recipe';
    const label = typeof r.label === 'string' ? r.label.slice(0, MAX_LABEL_LEN) : '';
    const profileKey = typeof r.profileKey === 'string' ? r.profileKey.slice(0, MAX_KEY_LEN) : '';
    const rawValue = typeof r.value === 'string' ? r.value.slice(0, MAX_VALUE_LEN) : '';
    const value = redactValue(profileKey, rawValue);
    const selector = typeof r.selector === 'string' ? r.selector.slice(0, MAX_SELECTOR_LEN) : '';
    const occurredAt = typeof r.occurredAt === 'string' ? r.occurredAt.slice(0, 32) : new Date().toISOString();
    if (!label || !profileKey) continue;
    out.push({ label, profileKey, value, selector, source, occurredAt });
  }
  return out;
}

export function sanitizeFillSummary(input: unknown): FillSummary {
  const r = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(999, Math.floor(v))) : 0);
  return {
    filled: num(r.filled),
    missingRequired: num(r.missingRequired),
    aiAssisted: num(r.aiAssisted),
    total: num(r.total)
  };
}
