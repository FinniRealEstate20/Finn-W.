import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACTIVE_BUYER_COOKIE } from '@/lib/activeBuyer';
import { mockBuyers, getDefaultBuyer } from '@/lib/mockData';
import { signRecipeToken } from '@/lib/recipeToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const store = await cookies();
  const id = store.get(ACTIVE_BUYER_COOKIE)?.value;
  const buyer = id ? mockBuyers.find(b => b.id === id) : null;
  const buyerId = buyer?.id ?? getDefaultBuyer().id;
  const token = signRecipeToken(buyerId);
  return NextResponse.json(
    { token, buyerId, ttlSeconds: 15 * 60 },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
