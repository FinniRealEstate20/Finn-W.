'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { generateInviteCode } from '@/lib/auth/inviteCode';
import { getSession } from '@/lib/auth/getUser';
import { rateLimit } from '@/lib/rateLimit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const SIGNUP_RATE_LIMIT_PER_HOUR = 5;

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface CreateInvitationResult {
  ok: boolean;
  message: string;
  code?: string;
  link?: string;
}

/**
 * Broker action: create a single-use invitation code for a buyer.
 * The optional label helps the broker remember which prospect the
 * code is meant for.
 */
export async function createInvitation(formData: FormData): Promise<CreateInvitationResult> {
  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) {
    return { ok: false, message: 'Nicht berechtigt.' };
  }

  const label = String(formData.get('label') ?? '').trim() || null;
  const locale = String(formData.get('locale') ?? 'de');

  const supabase = createSupabaseServerClient();
  // Up to 5 attempts in case of (vanishingly rare) code collision.
  let code = '';
  let inserted = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateInviteCode();
    const { error } = await supabase.from('invitations').insert({
      org_id: session.orgId,
      code,
      label,
      max_uses: 1,
      created_by: session.userId,
    });
    if (!error) {
      inserted = true;
      break;
    }
    // 23505 = unique_violation. Retry only on that.
    if (error.code !== '23505') {
      return { ok: false, message: 'Konnte Einladung nicht anlegen.' };
    }
  }
  if (!inserted) {
    return { ok: false, message: 'Konnte Einladung nicht anlegen.' };
  }

  revalidatePath(`/${locale}/broker/invitations`);
  return {
    ok: true,
    message: 'Einladung erstellt.',
    code,
    link: `${appUrl()}/${locale}/signup/buyer?code=${code}`,
  };
}

export async function deleteInvitation(formData: FormData): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) return { ok: false };
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { ok: false };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id)
    .eq('org_id', session.orgId);
  if (error) return { ok: false };

  const locale = String(formData.get('locale') ?? 'de');
  revalidatePath(`/${locale}/broker/invitations`);
  return { ok: true };
}

export interface BuyerSignupResult {
  ok: boolean;
  message: string;
}

/**
 * Public action: redeem an invitation code by starting the magic-link
 * signup flow. The code is re-validated here and again at /auth/callback,
 * so a single-use code can't slip past concurrent attempts.
 */
export async function signupBuyer(formData: FormData): Promise<BuyerSignupResult> {
  const code = String(formData.get('code') ?? '').trim();
  const email = normaliseEmail(String(formData.get('email') ?? ''));
  const fullName = String(formData.get('full_name') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'de');

  if (!code) return { ok: false, message: 'Einladungscode fehlt.' };
  if (!looksLikeEmail(email)) return { ok: false, message: 'E-Mail-Adresse ungültig.' };
  if (fullName.length < 2) return { ok: false, message: 'Bitte vollständigen Namen angeben.' };

  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const rl = await rateLimit(`buyer-signup:${ip}`, SIGNUP_RATE_LIMIT_PER_HOUR, 3600);
  if (!rl.allowed) {
    return { ok: false, message: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  }

  const supabase = createSupabaseServerClient();
  const { data: validation, error: rpcError } = await supabase.rpc(
    'validate_invitation',
    { code_input: code }
  );
  if (rpcError) {
    return { ok: false, message: 'Code-Prüfung fehlgeschlagen. Bitte erneut versuchen.' };
  }
  const row = Array.isArray(validation) ? validation[0] : null;
  if (!row || !row.valid) {
    return { ok: false, message: 'Einladungscode ist ungültig oder bereits verwendet.' };
  }

  const redirectTo = `${appUrl()}/auth/callback?locale=${encodeURIComponent(locale)}&intent=buyer`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
      data: {
        intent: 'buyer',
        full_name: fullName,
        invitation_id: row.invitation_id,
        org_id: row.org_id,
      },
    },
  });
  if (error) {
    return { ok: false, message: 'Anmeldung fehlgeschlagen. Bitte später erneut versuchen.' };
  }
  return {
    ok: true,
    message: 'Bitte E-Mail-Postfach prüfen und den Bestätigungslink öffnen.',
  };
}
