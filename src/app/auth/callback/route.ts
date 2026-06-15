import { type NextRequest, NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

/**
 * Magic-link landing endpoint.
 *
 * Flow:
 * 1. Exchange the code in the URL for a session cookie.
 * 2. If the signed-in user has user_metadata.intent === 'broker' and no
 *    broker_profile yet, bootstrap an org + broker_profile.
 * 3. Redirect to /<locale>/<destination> based on detected role.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const locale = searchParams.get('locale') ?? 'de';

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=missing_code`);
  }

  const supabase = createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=expired_link`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=session_lost`);
  }

  const [{ data: existingBroker }, { data: existingBuyer }] = await Promise.all([
    supabase
      .from('broker_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('buyer_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (existingBroker) {
    return NextResponse.redirect(`${origin}/${locale}/broker`);
  }
  if (existingBuyer) {
    return NextResponse.redirect(`${origin}/${locale}/dashboard`);
  }

  // No profile yet — bootstrap from user metadata when intent says broker.
  const meta = user.user_metadata ?? {};
  if (meta.intent === 'broker' && typeof meta.full_name === 'string') {
    const service = createSupabaseServiceClient();
    const orgName = meta.company || meta.full_name;
    const { data: org, error: orgError } = await service
      .from('orgs')
      .insert({
        name: orgName,
        owner_user_id: user.id,
        plan_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();
    if (orgError || !org) {
      return NextResponse.redirect(
        `${origin}/${locale}/login?error=org_bootstrap_failed`
      );
    }
    const { error: profError } = await service.from('broker_profiles').insert({
      user_id: user.id,
      org_id: org.id,
      full_name: meta.full_name,
      company: meta.company || null,
    });
    if (profError) {
      return NextResponse.redirect(
        `${origin}/${locale}/login?error=profile_bootstrap_failed`
      );
    }
    return NextResponse.redirect(`${origin}/${locale}/broker?welcome=1`);
  }

  // Fallback: the user authenticated but we don't know what to do with
  // them. Send them to the broker signup landing.
  return NextResponse.redirect(`${origin}/${locale}/signup/broker?completed=1`);
}
