import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * Sliding-window rate limiter backed by public.rate_limits. Service-role
 * only — never call from a browser-reachable surface without sanitising
 * the key first.
 *
 * Returns true if the call is allowed; false if it should be rejected.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createSupabaseServiceClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000).toISOString();

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('key', key)
    .maybeSingle();

  if (!existing || existing.window_start < windowStart) {
    await supabase
      .from('rate_limits')
      .upsert({ key, count: 1, window_start: now.toISOString() });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await supabase
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('key', key);

  return { allowed: true, remaining: limit - existing.count - 1 };
}
