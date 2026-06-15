import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/getUser';
import { getOrgBilling } from '@/lib/billing/org';
import { getStripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  locale?: string;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Body | null;
  const locale = body?.locale ?? 'de';

  const org = await getOrgBilling(session.orgId);
  if (!org?.stripeCustomerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const portal = await getStripe().billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${appUrl}/${locale}/broker/billing`,
  });

  return NextResponse.json({ url: portal.url });
}
