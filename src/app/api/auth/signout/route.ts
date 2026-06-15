import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  const url = new URL(req.url);
  const locale = url.searchParams.get('locale') ?? 'de';
  return NextResponse.redirect(`${url.origin}/${locale}/login?logout=1`, {
    status: 303,
  });
}
