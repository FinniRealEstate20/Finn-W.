import { createBrowserClient } from '@supabase/ssr';

// Browser-Client für Käufer-Auth (Magic Link, kein Passwort).
// Server-Clients ergänzen wir in Phase 2, wenn echte DB-Anbindung kommt.
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase-Konfiguration fehlt. Setze NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
