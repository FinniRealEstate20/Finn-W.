'use client';

import type { DocumentId } from '@/types';

const STORAGE_KEY = 'pac:submissions:v1';

export type SubmissionStatus = 'draft' | 'submitted' | 'confirmed' | 'failed';

export interface Submission {
  formId: DocumentId;
  status: SubmissionStatus;
  receiptId: string;
  channel: 'inhouse' | 'external_link' | 'communal_pdf';
  submittedAt: string;
  confirmedAt?: string;
  data: Record<string, string>;
  source?: string;
}

type Store = Record<string, Submission>;

function read(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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

export function clearSubmissions() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
