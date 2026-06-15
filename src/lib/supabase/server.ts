import { cookies } from 'next/headers';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

/**
 * Server-side Supabase client. Reads/writes the session cookies, so every
 * request runs as the authenticated user and RLS policies decide what they
 * can touch. Never bypasses RLS — use createSupabaseServiceClient() for that.
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      'Supabase-Konfiguration fehlt: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  const cookieStore = cookies();

  return createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie writes inside Server Components throw; the global
          // middleware handles refresh, so this is safe to ignore here.
        }
      },
    },
  });
}
