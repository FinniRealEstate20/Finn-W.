import { NextResponse } from 'next/server';
import { verifyRecipeToken } from '@/lib/recipeToken';
import { attachFillReceipt } from '@/lib/submissions/server';
import { sanitizeFillAudit, sanitizeFillSummary } from '@/lib/fillAudit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ReceiptBody {
  token?: string;
  clientReceiptId?: string;
  fillAudit?: unknown;
  fillSummary?: unknown;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ReceiptBody | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400, headers: CORS_HEADERS });
  }

  const payload = verifyRecipeToken(body.token ?? '');
  if (!payload) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401, headers: CORS_HEADERS });
  }

  const clientReceiptId =
    (typeof body.clientReceiptId === 'string' && body.clientReceiptId) ||
    payload.clientReceiptId;
  if (!clientReceiptId) {
    return NextResponse.json({ error: 'missing_receipt_id' }, { status: 400, headers: CORS_HEADERS });
  }

  const fillAudit = sanitizeFillAudit(body.fillAudit);
  const fillSummary = sanitizeFillSummary(body.fillSummary);

  const updated = attachFillReceipt(clientReceiptId.slice(0, 64), fillAudit, fillSummary);
  if (!updated) {
    return NextResponse.json(
      { error: 'submission_not_found', clientReceiptId },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      serverReceiptId: updated.serverReceiptId,
      fillReceiptAt: updated.fillReceiptAt,
      audited: fillAudit.length
    },
    { headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } }
  );
}
