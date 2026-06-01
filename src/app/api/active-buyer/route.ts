import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mockBuyers } from '@/lib/mockData';
import { ACTIVE_BUYER_COOKIE } from '@/lib/activeBuyer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!mockBuyers.find(b => b.id === id)) {
    return NextResponse.json({ error: 'unknown_buyer' }, { status: 400 });
  }
  const store = await cookies();
  store.set(ACTIVE_BUYER_COOKIE, id, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  return NextResponse.json({ ok: true, id });
}
