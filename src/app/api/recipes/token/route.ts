import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACTIVE_BUYER_COOKIE } from '@/lib/activeBuyer';
import { mockBuyers, getDefaultBuyer } from '@/lib/mockData';
import { signRecipeToken } from '@/lib/recipeToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TokenBody {
  clientReceiptId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as TokenBody | null;
  const store = await cookies();
  const id = store.get(ACTIVE_BUYER_COOKIE)?.value;
  const buyer = id ? mockBuyers.find(b => b.id === id) : null;
  const buyerId = buyer?.id ?? getDefaultBuyer().id;
  const receiptId =
    body && typeof body.clientReceiptId === 'string' && body.clientReceiptId
      ? body.clientReceiptId.slice(0, 64)
      : undefined;
  const token = signRecipeToken(buyerId, receiptId);
  return NextResponse.json(
    { token, buyerId, clientReceiptId: receiptId, ttlSeconds: 15 * 60 },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
