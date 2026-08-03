import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/getUser';
import {
  listDbSubmissions,
  persistDbSubmission,
} from '@/lib/data/submissions';
import {
  clearAllSubmissions,
  listSubmissions,
  persistSubmission,
  type SubmissionChannel,
  type SubmissionStatus,
} from '@/lib/submissions/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_CHANNELS: SubmissionChannel[] = ['inhouse', 'external_link', 'communal_pdf'];
const ALLOWED_STATUS: SubmissionStatus[] = ['draft', 'submitted', 'confirmed', 'failed'];

interface PostBody {
  formId?: string;
  channel?: SubmissionChannel;
  status?: SubmissionStatus;
  clientReceiptId?: string;
  source?: string;
  data?: Record<string, string>;
  submittedAt?: string;
  buyer?: { id?: string; email?: string };
}

function sanitizeData(input: Record<string, unknown> | undefined): Record<string, string> {
  if (!input || typeof input !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'string') out[k.slice(0, 64)] = v.slice(0, 500);
  }
  return out;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as PostBody | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const formId = typeof body.formId === 'string' ? body.formId.slice(0, 64) : '';
  const channel = body.channel && ALLOWED_CHANNELS.includes(body.channel) ? body.channel : null;
  const status = body.status && ALLOWED_STATUS.includes(body.status) ? body.status : 'submitted';
  const clientReceiptId =
    typeof body.clientReceiptId === 'string' ? body.clientReceiptId.slice(0, 64) : '';

  if (!formId || !channel || !clientReceiptId) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const data = sanitizeData(body.data);
  const source = typeof body.source === 'string' ? body.source.slice(0, 200) : undefined;
  const submittedAt =
    typeof body.submittedAt === 'string' ? body.submittedAt : new Date().toISOString();

  const session = await getSession();

  // Signed-in buyer: persist to DB under their user_id. We ignore the
  // body.buyer field — the session is the source of truth.
  if (session?.role === 'buyer') {
    const record = await persistDbSubmission({
      formId,
      channel,
      status,
      clientReceiptId,
      source,
      data,
      buyerId: session.userId,
      submittedAt,
    });
    return NextResponse.json({
      ok: true,
      serverReceiptId: record.serverReceiptId,
      persistedAt: record.persistedAt,
      status: record.status,
    });
  }

  // Demo / unauthenticated path: keep the in-memory store so the
  // marketing landing flow still works.
  const record = persistSubmission({
    formId,
    channel,
    status,
    clientReceiptId,
    source,
    data,
    buyer:
      body.buyer && typeof body.buyer === 'object'
        ? {
            id: typeof body.buyer.id === 'string' ? body.buyer.id.slice(0, 64) : undefined,
            email:
              typeof body.buyer.email === 'string'
                ? body.buyer.email.slice(0, 120)
                : undefined,
          }
        : undefined,
    submittedAt,
  });

  return NextResponse.json({
    ok: true,
    serverReceiptId: record.serverReceiptId,
    persistedAt: record.persistedAt,
    status: record.status,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50) || 50, 200);
  const buyerId = url.searchParams.get('buyerId') ?? undefined;
  const session = await getSession();

  if (session?.role === 'buyer' || session?.role === 'broker') {
    const items = await listDbSubmissions({
      limit,
      buyerId: session.role === 'buyer' ? session.userId : buyerId,
    });
    return NextResponse.json({ count: items.length, items });
  }

  const items = listSubmissions({ limit, buyerId }).map(r => ({
    formId: r.formId,
    channel: r.channel,
    status: r.status,
    serverReceiptId: r.serverReceiptId,
    clientReceiptId: r.clientReceiptId,
    submittedAt: r.submittedAt,
    persistedAt: r.persistedAt,
    buyer: r.buyer,
  }));
  return NextResponse.json({ count: items.length, items });
}

export async function DELETE() {
  // Only clears the in-memory store; DB rows are immutable from this endpoint.
  clearAllSubmissions();
  return NextResponse.json({ ok: true });
}
