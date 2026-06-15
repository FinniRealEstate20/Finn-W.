export type PlanTier = 'starter' | 'pro' | 'business';

export interface PlanDefinition {
  id: PlanTier;
  /** Env var that holds the Stripe Price ID (we keep prices in the dashboard). */
  priceIdEnv: 'STRIPE_PRICE_ID_STARTER' | 'STRIPE_PRICE_ID_PRO' | 'STRIPE_PRICE_ID_BUSINESS';
  monthlyPriceEur: number;
  /** null = unlimited */
  maxActiveBuyers: number | null;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  starter: {
    id: 'starter',
    priceIdEnv: 'STRIPE_PRICE_ID_STARTER',
    monthlyPriceEur: 49,
    maxActiveBuyers: 5,
    whiteLabel: false,
    prioritySupport: false,
  },
  pro: {
    id: 'pro',
    priceIdEnv: 'STRIPE_PRICE_ID_PRO',
    monthlyPriceEur: 149,
    maxActiveBuyers: 25,
    whiteLabel: false,
    prioritySupport: true,
  },
  business: {
    id: 'business',
    priceIdEnv: 'STRIPE_PRICE_ID_BUSINESS',
    monthlyPriceEur: 399,
    maxActiveBuyers: null,
    whiteLabel: true,
    prioritySupport: true,
  },
};

export function getPriceId(tier: PlanTier): string {
  const env = PLANS[tier].priceIdEnv;
  const id = process.env[env];
  if (!id) throw new Error(`${env} not configured`);
  return id;
}

export function planForPriceId(priceId: string): PlanTier | null {
  for (const tier of Object.keys(PLANS) as PlanTier[]) {
    if (process.env[PLANS[tier].priceIdEnv] === priceId) return tier;
  }
  return null;
}
