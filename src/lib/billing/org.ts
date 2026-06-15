import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

import type { PlanTier } from './plans';

export type SubscriptionStatusDb =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'inactive';

export interface OrgBilling {
  id: string;
  name: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planTier: PlanTier | null;
  planStatus: SubscriptionStatusDb;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

const SELECT =
  'id, name, stripe_customer_id, stripe_subscription_id, plan_tier, plan_status, trial_ends_at, current_period_end';

interface OrgRow {
  id: string;
  name: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_tier: PlanTier | null;
  plan_status: SubscriptionStatusDb;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

function rowToBilling(row: OrgRow): OrgBilling {
  return {
    id: row.id,
    name: row.name,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    planTier: row.plan_tier,
    planStatus: row.plan_status,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
  };
}

export async function getOrgBilling(orgId: string): Promise<OrgBilling | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('orgs')
    .select(SELECT)
    .eq('id', orgId)
    .maybeSingle<OrgRow>();
  return data ? rowToBilling(data) : null;
}

export async function setOrgCustomerId(
  orgId: string,
  stripeCustomerId: string
): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase
    .from('orgs')
    .update({ stripe_customer_id: stripeCustomerId })
    .eq('id', orgId);
}

interface BillingUpdate {
  stripeSubscriptionId?: string | null;
  planTier?: PlanTier | null;
  planStatus?: SubscriptionStatusDb;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
}

/**
 * Webhook-side update — uses the service role since Stripe is the caller
 * and there's no broker session in scope.
 */
export async function updateOrgBilling(
  orgId: string,
  update: BillingUpdate
): Promise<void> {
  const service = createSupabaseServiceClient();
  await service
    .from('orgs')
    .update({
      stripe_subscription_id: update.stripeSubscriptionId,
      plan_tier: update.planTier,
      plan_status: update.planStatus,
      trial_ends_at: update.trialEndsAt,
      current_period_end: update.currentPeriodEnd,
    })
    .eq('id', orgId);
}

export async function findOrgByCustomerId(
  customerId: string
): Promise<{ id: string } | null> {
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from('orgs')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle<{ id: string }>();
  return data ?? null;
}
