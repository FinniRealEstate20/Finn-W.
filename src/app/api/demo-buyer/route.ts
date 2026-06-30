import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ACTIVE_BUYER_COOKIE } from '@/lib/activeBuyer';
import {
  clearDemoBuyer,
  DEMO_SELF_ID,
  setDemoBuyer,
  type DemoBuyerInput,
} from '@/lib/demoBuyer';
import type { PropertyType } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PROPERTY_TYPES: PropertyType[] = [
  'ownUse',
  'investment-self',
  'investment-managed',
];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<DemoBuyerInput> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const propertyType =
    typeof body.propertyType === 'string' &&
    VALID_PROPERTY_TYPES.includes(body.propertyType as PropertyType)
      ? (body.propertyType as PropertyType)
      : null;

  if (!propertyType) {
    return NextResponse.json({ error: 'invalid_property_type' }, { status: 400 });
  }

  const input: DemoBuyerInput = {
    name: typeof body.name === 'string' ? body.name : '',
    email: typeof body.email === 'string' ? body.email : undefined,
    propertyType,
    city: typeof body.city === 'string' ? body.city : '',
    moveInDate: typeof body.moveInDate === 'string' ? body.moveInDate : '',
  };

  const ok = await setDemoBuyer(input);
  if (!ok) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const store = await cookies();
  store.set(ACTIVE_BUYER_COOKIE, DEMO_SELF_ID, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, id: DEMO_SELF_ID });
}

export async function DELETE() {
  await clearDemoBuyer();
  const store = await cookies();
  store.delete(ACTIVE_BUYER_COOKIE);
  return NextResponse.json({ ok: true });
}
