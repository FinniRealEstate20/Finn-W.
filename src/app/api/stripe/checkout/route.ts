import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/getUser';
import { getOrgBilling, setOrgCustomerId } from '@/lib/billing/org';
import { getPriceId, PLANS, type PlanTier } from '@/lib/billing/plans';
import { getStripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  tier?: PlanTier;
  locale?: string;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const tier = body?.tier;
  if (!tier || !(tier in PLANS)) {
    return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
  }

  const locale = body?.locale ?? 'de';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const successUrl = `${appUrl}/${locale}/broker/billing?success=1`;
  const cancelUrl = `${appUrl}/${locale}/broker/billing?canceled=1`;

  const stripe = getStripe();
  const org = await getOrgBilling(session.orgId);
  if (!org) {
    return NextResponse.json({ error: 'org_not_found' }, { status: 404 });
  }

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      name: org.name,
      metadata: { org_id: org.id, owner_user_id: session.userId },
    });
    customerId = customer.id;
    await setOrgCustomerId(org.id, customerId);
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: getPriceId(tier), quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { org_id: org.id, tier },
    subscription_data: {
      metadata: { org_id: org.id, tier },
    },
  });

  return NextResponse.json({ url: checkout.url });
}
