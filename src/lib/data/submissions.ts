import { randomBytes } from 'node:crypto';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type {
  SubmissionChannel,
  SubmissionRecord,
  SubmissionStatus,
} from '@/lib/submissions/server';
import type { FillAuditEntry, FillSummary } from '@/lib/fillAudit';

type SubmissionStatusDb = 'draft' | 'submitted' | 'confirmed' | 'failed';

function makeServerReceiptId(formId: string): string {
  const tag = formId.replace(/[^a-z]/gi, '').slice(0, 4).toUpperCase() || 'FORM';
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `SRV-${tag}-${random}`;
}

interface SubmissionInput {
  formId: string;
  channel: SubmissionChannel;
  status: SubmissionStatus;
  clientReceiptId: string;
  source?: string;
  data: Record<string, string>;
  buyerId: string;
  submittedAt: string;
}

/**
 * Insert or upsert a submission row owned by the signed-in buyer.
 * Returns a SubmissionRecord shaped identically to the in-memory store
 * so the API route doesn't care which backend produced it.
 */
export async function persistDbSubmission(
  input: SubmissionInput
): Promise<SubmissionRecord> {
  const supabase = createSupabaseServerClient();
  const fillSummary = { source: input.source ?? null, data: input.data };

  const { data: existing } = await supabase
    .from('submissions')
    .select('id, server_receipt_id, status, fill_summary, created_at, updated_at')
    .eq('buyer_id', input.buyerId)
    .eq('client_receipt_id', input.clientReceiptId)
    .maybeSingle<{
      id: string;
      server_receipt_id: string;
      status: SubmissionStatusDb;
      fill_summary: { source: string | null; data: Record<string, string> } | null;
      created_at: string;
      updated_at: string;
    }>();

  if (existing) {
    const { data: updated } = await supabase
      .from('submissions')
      .update({
        status: input.status,
        fill_summary: fillSummary,
      })
      .eq('id', existing.id)
      .select('id, server_receipt_id, status, updated_at')
      .single<{
        id: string;
        server_receipt_id: string;
        status: SubmissionStatusDb;
        updated_at: string;
      }>();
    return toRecord({
      ...input,
      serverReceiptId: updated?.server_receipt_id ?? existing.server_receipt_id,
      persistedAt: updated?.updated_at ?? new Date().toISOString(),
    });
  }

  const serverReceiptId = makeServerReceiptId(input.formId);
  const { data: inserted } = await supabase
    .from('submissions')
    .insert({
      buyer_id: input.buyerId,
      doc_id: input.formId,
      status: input.status,
      client_receipt_id: input.clientReceiptId,
      server_receipt_id: serverReceiptId,
      fill_summary: fillSummary,
    })
    .select('id, server_receipt_id, updated_at')
    .single<{ id: string; server_receipt_id: string; updated_at: string }>();

  return toRecord({
    ...input,
    serverReceiptId: inserted?.server_receipt_id ?? serverReceiptId,
    persistedAt: inserted?.updated_at ?? new Date().toISOString(),
  });
}

function toRecord(
  input: SubmissionInput & { serverReceiptId: string; persistedAt: string }
): SubmissionRecord {
  return {
    formId: input.formId,
    channel: input.channel,
    status: input.status,
    clientReceiptId: input.clientReceiptId,
    serverReceiptId: input.serverReceiptId,
    source: input.source,
    data: input.data,
    buyer: { id: input.buyerId },
    submittedAt: input.submittedAt,
    persistedAt: input.persistedAt,
  };
}

/**
 * Attach fill-audit entries to an existing submission. Called from the
 * bookmarklet via a recipe-token, so there's no session — we use the
 * service role to bypass RLS, but only after looking up the submission
 * by the unguessable client_receipt_id so the surface is still tight.
 */
export async function attachDbFillReceipt(
  clientReceiptId: string,
  fillAudit: FillAuditEntry[],
  fillSummary: FillSummary
): Promise<{ serverReceiptId: string; fillReceiptAt: string; audited: number } | null> {
  const service = createSupabaseServiceClient();

  const { data: submission } = await service
    .from('submissions')
    .select('id, buyer_id, server_receipt_id, fill_summary')
    .eq('client_receipt_id', clientReceiptId)
    .maybeSingle<{
      id: string;
      buyer_id: string;
      server_receipt_id: string;
      fill_summary: Record<string, unknown> | null;
    }>();
  if (!submission) return null;

  const now = new Date().toISOString();
  const mergedSummary = {
    ...(submission.fill_summary ?? {}),
    fillSummary,
    fillReceiptAt: now,
  };

  await service
    .from('submissions')
    .update({ fill_summary: mergedSummary })
    .eq('id', submission.id);

  if (fillAudit.length > 0) {
    await service.from('fill_audit_entries').insert(
      fillAudit.map(entry => ({
        submission_id: submission.id,
        label: entry.label,
        profile_key: entry.profileKey,
        value_redacted: entry.value,
        selector: entry.selector,
        source: entry.source,
      }))
    );
  }

  return {
    serverReceiptId: submission.server_receipt_id,
    fillReceiptAt: now,
    audited: fillAudit.length,
  };
}

/**
 * List submissions visible under the current session. Buyers see their
 * own; brokers see everything in their org (RLS handles the scope).
 */
export async function listDbSubmissions(opts?: {
  limit?: number;
  buyerId?: string;
}): Promise<SubmissionRecord[]> {
  const supabase = createSupabaseServerClient();
  const limit = Math.min(opts?.limit ?? 50, 200);
  let query = supabase
    .from('submissions')
    .select(
      'id, buyer_id, doc_id, status, client_receipt_id, server_receipt_id, fill_summary, created_at, updated_at'
    )
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (opts?.buyerId) query = query.eq('buyer_id', opts.buyerId);

  const { data } = await query;
  return (data ?? []).map((row: {
    buyer_id: string;
    doc_id: string;
    status: SubmissionStatusDb;
    client_receipt_id: string | null;
    server_receipt_id: string | null;
    fill_summary: { source?: string | null; data?: Record<string, string> } | null;
    created_at: string;
    updated_at: string;
  }) => ({
    formId: row.doc_id,
    channel: 'inhouse' as SubmissionChannel,
    status: row.status,
    clientReceiptId: row.client_receipt_id ?? '',
    serverReceiptId: row.server_receipt_id ?? '',
    source: row.fill_summary?.source ?? undefined,
    data: row.fill_summary?.data ?? {},
    buyer: { id: row.buyer_id },
    submittedAt: row.created_at,
    persistedAt: row.updated_at,
  }));
}
