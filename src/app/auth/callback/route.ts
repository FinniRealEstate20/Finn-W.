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

  // No profile yet — bootstrap from user metadata.
  const meta = user.user_metadata ?? {};
  const service = createSupabaseServiceClient();

  if (meta.intent === 'broker' && typeof meta.full_name === 'string') {
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

  if (
    meta.intent === 'buyer' &&
    typeof meta.full_name === 'string' &&
    typeof meta.invitation_id === 'string' &&
    typeof meta.org_id === 'string'
  ) {
    // Re-validate the invitation server-side, because it may have been
    // exhausted between the magic-link request and this callback.
    const { data: inv } = await service
      .from('invitations')
      .select('id, org_id, max_uses, used_count, expires_at')
      .eq('id', meta.invitation_id)
      .maybeSingle();
    if (
      !inv ||
      inv.org_id !== meta.org_id ||
      (inv.max_uses != null && inv.used_count >= inv.max_uses) ||
      (inv.expires_at && new Date(inv.expires_at) < new Date())
    ) {
      return NextResponse.redirect(
        `${origin}/${locale}/signup/buyer?error=exhausted`
      );
    }
    const { error: buyerErr } = await service.from('buyer_profiles').insert({
      user_id: user.id,
      org_id: meta.org_id,
      invitation_id: meta.invitation_id,
      full_name: meta.full_name,
      email: user.email ?? '',
    });
    if (buyerErr) {
      return NextResponse.redirect(
        `${origin}/${locale}/login?error=profile_bootstrap_failed`
      );
    }
    return NextResponse.redirect(`${origin}/${locale}/welcome`);
  }

  // Fallback: the user authenticated but we don't know what to do with
  // them. Send them to the broker signup landing.
  return NextResponse.redirect(`${origin}/${locale}/signup/broker?completed=1`);
}
