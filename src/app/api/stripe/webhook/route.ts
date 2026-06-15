import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { findOrgByCustomerId, updateOrgBilling } from '@/lib/billing/org';
import { planForPriceId } from '@/lib/billing/plans';
import { getStripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe sends the raw request body; we need to verify it byte-for-byte
// against the signature header. Next.js's NextRequest.text() works for that.

function isoOrNull(unix: number | null | undefined): string | null {
  if (unix == null) return null;
  return new Date(unix * 1000).toISOString();
}

function mapStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case 'trialing':
      return 'trialing' as const;
    case 'active':
      return 'active' as const;
    case 'past_due':
    case 'unpaid':
      return 'past_due' as const;
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled' as const;
    default:
      return 'inactive' as const;
  }
}

async function applySubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const org = await findOrgByCustomerId(customerId);
  if (!org) return;

  const priceId = sub.items.data[0]?.price.id ?? null;
  const planTier = priceId ? planForPriceId(priceId) : null;

  await updateOrgBilling(org.id, {
    stripeSubscriptionId: sub.id,
    planTier,
    planStatus: mapStatus(sub.status),
    trialEndsAt: isoOrNull(sub.trial_end),
    currentPeriodEnd: isoOrNull(sub.current_period_end),
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'webhook_secret_missing' }, { status: 500 });
  }
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const raw = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkout = event.data.object as Stripe.Checkout.Session;
      if (checkout.subscription) {
        const subId =
          typeof checkout.subscription === 'string'
            ? checkout.subscription
            : checkout.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await applySubscription(sub);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await applySubscription(sub);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
