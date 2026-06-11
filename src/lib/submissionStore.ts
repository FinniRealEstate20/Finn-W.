'use client';

import type { DocumentId } from '@/types';
import type { FillAuditEntry, FillSummary } from './fillAudit';

const STORAGE_PREFIX = 'pac:submissions';
const LEGACY_KEY = 'pac:submissions:v1';
const FALLBACK_BUYER_ID = 'julia-m';

export type SubmissionStatus = 'draft' | 'submitted' | 'confirmed' | 'failed';

export interface Submission {
  formId: DocumentId;
  status: SubmissionStatus;
  receiptId: string;
  serverReceiptId?: string;
  serverPersistedAt?: string;
  serverError?: string;
  channel: 'inhouse' | 'external_link' | 'communal_pdf';
  submittedAt: string;
  confirmedAt?: string;
  data: Record<string, string>;
  source?: string;
  fillAudit?: FillAuditEntry[];
  fillSummary?: FillSummary;
  fillReceiptAt?: string;
}

type Store = Record<string, Submission>;

function getActiveBuyerId(): string {
  if (typeof document === 'undefined') return FALLBACK_BUYER_ID;
  const match = document.cookie
    .split('; ')
    .find(c => c.startsWith('pac-active-buyer='));
  return match ? decodeURIComponent(match.split('=')[1]) : FALLBACK_BUYER_ID;
}

function keyFor(buyerId: string): string {
  return `${STORAGE_PREFIX}:${buyerId}:v1`;
}

function migrateLegacy() {
  if (typeof window === 'undefined') return;
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const target = keyFor(FALLBACK_BUYER_ID);
    if (!window.localStorage.getItem(target)) {
      window.localStorage.setItem(target, legacy);
    }
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

function read(): Store {
  if (typeof window === 'undefined') return {};
  migrateLegacy();
  try {
    const raw = window.localStorage.getItem(keyFor(getActiveBuyerId()));
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(keyFor(getActiveBuyerId()), JSON.stringify(store));
  } catch {
    // ignore
  }
}

function makeReceiptId(formId: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const tag = formId.replace(/[^a-z]/gi, '').slice(0, 4).toUpperCase();
  return `PAC-${tag}-${stamp}`;
}

export function loadSubmissions(): Store {
  return read();
}

export function getSubmission(formId: DocumentId): Submission | undefined {
  return read()[formId];
}

export function recordSubmission(input: Omit<Submission, 'receiptId' | 'submittedAt' | 'status' | 'confirmedAt'> & {
  status?: SubmissionStatus;
}): Submission {
  const submission: Submission = {
    receiptId: makeReceiptId(input.formId),
    submittedAt: new Date().toISOString(),
    status: input.status ?? 'submitted',
    ...input
  };
  const store = read();
  store[input.formId] = submission;
  write(store);
  return submission;
}

export function confirmSubmission(formId: DocumentId): Submission | undefined {
  const store = read();
  const current = store[formId];
  if (!current) return undefined;
  const updated: Submission = {
    ...current,
    status: 'confirmed',
    confirmedAt: new Date().toISOString()
  };
  store[formId] = updated;
  write(store);
  return updated;
}

export function updateSubmission(formId: DocumentId, patch: Partial<Submission>): Submission | undefined {
  const store = read();
  const current = store[formId];
  if (!current) return undefined;
  const updated: Submission = { ...current, ...patch };
  store[formId] = updated;
  write(store);
  return updated;
}

export async function pushSubmissionToServer(
  submission: Submission,
  buyer?: { id?: string; email?: string }
): Promise<Submission> {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: submission.formId,
        channel: submission.channel,
        status: submission.status,
        clientReceiptId: submission.receiptId,
        source: submission.source,
        data: submission.data,
        buyer,
        submittedAt: submission.submittedAt
      })
    });
    if (!res.ok) {
      const updated = updateSubmission(submission.formId, {
        serverError: `HTTP ${res.status}`
      });
      return updated ?? submission;
    }
    const json = (await res.json()) as {
      serverReceiptId?: string;
      persistedAt?: string;
    };
    const updated = updateSubmission(submission.formId, {
      serverReceiptId: json.serverReceiptId,
      serverPersistedAt: json.persistedAt,
      serverError: undefined
    });
    return updated ?? submission;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'network_error';
    const updated = updateSubmission(submission.formId, { serverError: message });
    return updated ?? submission;
  }
}

export function clearSubmissions() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(keyFor(getActiveBuyerId()));
  } catch {
    // ignore
  }
}

interface ServerSubmissionItem {
  formId: DocumentId;
  status: SubmissionStatus;
  clientReceiptId: string;
  serverReceiptId?: string;
  persistedAt?: string;
  fillAudit?: FillAuditEntry[];
  fillSummary?: FillSummary;
  fillReceiptAt?: string;
}

export async function fetchServerSubmissions(buyerId?: string): Promise<{
  merged: number;
  added: number;
}> {
  if (typeof window === 'undefined') return { merged: 0, added: 0 };
  const id = buyerId ?? getActiveBuyerId();
  try {
    const res = await fetch(`/api/submissions?buyerId=${encodeURIComponent(id)}`, {
      cache: 'no-store'
    });
    if (!res.ok) return { merged: 0, added: 0 };
    const data = (await res.json()) as { items: ServerSubmissionItem[] };
    const store = read();
    let merged = 0;
    let added = 0;
    for (const item of data.items ?? []) {
      if (!item.fillAudit && !item.fillSummary) continue;
      const existing = store[item.formId];
      if (existing && existing.receiptId === item.clientReceiptId) {
        store[item.formId] = {
          ...existing,
          fillAudit: item.fillAudit ?? existing.fillAudit,
          fillSummary: item.fillSummary ?? existing.fillSummary,
          fillReceiptAt: item.fillReceiptAt ?? existing.fillReceiptAt,
          serverReceiptId: item.serverReceiptId ?? existing.serverReceiptId
        };
        merged += 1;
      } else if (!existing && item.fillAudit) {
        store[item.formId] = {
          formId: item.formId,
          status: item.status,
          receiptId: item.clientReceiptId,
          serverReceiptId: item.serverReceiptId,
          serverPersistedAt: item.persistedAt,
          channel: 'external_link',
          submittedAt: item.persistedAt ?? new Date().toISOString(),
          data: {},
          fillAudit: item.fillAudit,
          fillSummary: item.fillSummary,
          fillReceiptAt: item.fillReceiptAt
        };
        added += 1;
      }
    }
    if (merged > 0 || added > 0) write(store);
    return { merged, added };
  } catch {
    return { merged: 0, added: 0 };
  }
}
