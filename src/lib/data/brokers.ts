import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Broker } from '@/types';

interface BrokerRow {
  user_id: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  photo_url: string | null;
  brand_color: string | null;
  google_review_url: string | null;
}

/**
 * Resolve the broker representing an org. For V1 we treat the first row
 * as the "face" of the org (Makler-Büro = 1 Makler in der Regel);
 * multi-user-per-org comes later.
 */
export async function getBrokerForOrg(orgId: string): Promise<Broker | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('broker_profiles')
    .select('user_id, full_name, company, phone, photo_url, brand_color, google_review_url')
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle<BrokerRow>();
  if (!data) return null;
  return {
    id: data.user_id,
    name: data.full_name,
    company: data.company ?? '',
    city: '',
    email: '',
    phone: data.phone ?? '',
    photoUrl: data.photo_url ?? '/founder.jpg',
    brandColor: data.brand_color ?? '#0469c4',
    googleReviewUrl: data.google_review_url ?? '',
    reviews: {
      total: 0,
      average: 0,
      requestsSent: 0,
      lastReviewText: '',
      lastReviewStars: 0,
    },
    curatorPoints: { currentQuarter: 0, totalConfirmed: 0 },
  };
}
