import { type NextRequest, NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

/**
 * Refreshes the Supabase session cookie on every request so that
 * subsequent Server Components and route handlers see a fresh JWT.
 * Mutates the passed-in response by writing any updated auth cookies onto it.
 */
export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
