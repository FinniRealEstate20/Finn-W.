import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from './i18n/config';
import { updateSupabaseSession } from './lib/supabase/middleware';

const intl = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  const response = intl(request) ?? NextResponse.next({ request });
  return updateSupabaseSession(request, response);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
