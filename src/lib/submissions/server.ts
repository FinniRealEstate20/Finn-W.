import { randomBytes } from 'node:crypto';

export type SubmissionChannel = 'inhouse' | 'external_link' | 'communal_pdf';
export type SubmissionStatus = 'draft' | 'submitted' | 'confirmed' | 'failed';

export interface SubmissionRecord {
  formId: string;
  channel: SubmissionChannel;
  status: SubmissionStatus;
  clientReceiptId: string;
  serverReceiptId: string;
  source?: string;
  data: Record<string, string>;
  buyer?: { id?: string; email?: string };
  submittedAt: string;
  persistedAt: string;
}

const MAX_ENTRIES = 500;

interface Store {
  list: SubmissionRecord[];
  byClientReceipt: Map<string, SubmissionRecord>;
}

function getStore(): Store {
  const g = globalThis as unknown as { __pacSubmissions?: Store };
  if (!g.__pacSubmissions) {
    g.__pacSubmissions = { list: [], byClientReceipt: new Map() };
  }
  return g.__pacSubmissions;
}

export function makeServerReceiptId(formId: string): string {
  const tag = formId.replace(/[^a-z]/gi, '').slice(0, 4).toUpperCase() || 'FORM';
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `SRV-${tag}-${random}`;
}

export function persistSubmission(
  input: Omit<SubmissionRecord, 'serverReceiptId' | 'persistedAt'>
): SubmissionRecord {
  const store = getStore();
  const existing = store.byClientReceipt.get(input.clientReceiptId);
  if (existing) {
    const updated: SubmissionRecord = {
      ...existing,
      status: input.status,
      data: input.data,
      buyer: input.buyer ?? existing.buyer,
      persistedAt: new Date().toISOString()
    };
    store.byClientReceipt.set(updated.clientReceiptId, updated);
    const idx = store.list.findIndex(r => r.clientReceiptId === updated.clientReceiptId);
    if (idx >= 0) store.list[idx] = updated;
    return updated;
  }
  const record: SubmissionRecord = {
    ...input,
    serverReceiptId: makeServerReceiptId(input.formId),
    persistedAt: new Date().toISOString()
  };
  store.list.unshift(record);
  if (store.list.length > MAX_ENTRIES) store.list.length = MAX_ENTRIES;
  store.byClientReceipt.set(record.clientReceiptId, record);
  return record;
}

export function listSubmissions(limit = 50): SubmissionRecord[] {
  return getStore().list.slice(0, limit);
}
