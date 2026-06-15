import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. **Bypasses RLS.** Use only inside trusted
 * server contexts: Stripe webhooks, cron jobs, DSGVO delete sweepers, and
 * the org-bootstrap step of broker signup. Never expose to the browser.
 */
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase-Service-Konfiguration fehlt: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
