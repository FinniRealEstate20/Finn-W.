'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { generateInviteCode } from '@/lib/auth/inviteCode';
import { getSession } from '@/lib/auth/getUser';
import { rateLimit } from '@/lib/rateLimit';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEmail, emailEnabled } from '@/lib/email/client';
import { renderInvitationEmail } from '@/lib/email/templates/invitationEmail';

const SIGNUP_RATE_LIMIT_PER_HOUR = 5;
const RESEND_RATE_LIMIT_PER_HOUR = 10;

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
  emailSent?: boolean;
  emailError?: string;
}

interface BrokerSenderContext {
  name: string;
  company: string | null;
  brandColor: string | null;
  replyTo: string;
}

async function loadBrokerContext(userId: string, email: string): Promise<BrokerSenderContext> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('broker_profiles')
    .select('full_name, company, brand_color')
    .eq('user_id', userId)
    .maybeSingle();
  return {
    name: data?.full_name ?? email,
    company: data?.company ?? null,
    brandColor: data?.brand_color ?? null,
    replyTo: email,
  };
}

async function dispatchInvitationEmail(opts: {
  invitationId: string;
  code: string;
  recipientEmail: string;
  recipientName: string | null;
  locale: string;
  broker: BrokerSenderContext;
}): Promise<{ ok: boolean; error?: string }> {
  const link = `${appUrl()}/${opts.locale}/signup/buyer?code=${opts.code}`;
  const rendered = renderInvitationEmail({
    recipientName: opts.recipientName,
    brokerName: opts.broker.name,
    companyName: opts.broker.company,
    brandColor: opts.broker.brandColor,
    signupUrl: link,
    code: opts.code,
  });
  const result = await sendEmail({
    to: opts.recipientEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: opts.broker.replyTo,
  });
  const supabase = createSupabaseServerClient();
  if (!result.ok) {
    await supabase
      .from('invitations')
      .update({ last_send_error: result.error ?? 'Unbekannter Fehler' })
      .eq('id', opts.invitationId);
    return { ok: false, error: result.error };
  }
  const { data: current } = await supabase
    .from('invitations')
    .select('send_count')
    .eq('id', opts.invitationId)
    .maybeSingle();
  await supabase
    .from('invitations')
    .update({
      sent_at: new Date().toISOString(),
      last_send_error: null,
      send_count: (current?.send_count ?? 0) + 1,
    })
    .eq('id', opts.invitationId);
  return { ok: true };
}

/**
 * Broker action: create a single-use invitation code for a buyer. If
 * `email` is supplied AND Resend is configured, the code is also
 * dispatched as a branded German email. Without Resend, the broker
 * still gets the copy-link result.
 */
export async function createInvitation(formData: FormData): Promise<CreateInvitationResult> {
  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) {
    return { ok: false, message: 'Nicht berechtigt.' };
  }

  const label = String(formData.get('label') ?? '').trim() || null;
  const rawEmail = String(formData.get('email') ?? '').trim();
  const recipientEmail = rawEmail ? normaliseEmail(rawEmail) : null;
  if (recipientEmail && !looksLikeEmail(recipientEmail)) {
    return { ok: false, message: 'E-Mail-Adresse ungültig.' };
  }
  const locale = String(formData.get('locale') ?? 'de');

  const supabase = createSupabaseServerClient();
  let code = '';
  let invitationId = '';
  let inserted = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateInviteCode();
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        org_id: session.orgId,
        code,
        label,
        email: recipientEmail,
        max_uses: 1,
        created_by: session.userId,
      })
      .select('id')
      .single();
    if (!error && data) {
      inserted = true;
      invitationId = data.id;
      break;
    }
    if (error && error.code !== '23505') {
      return { ok: false, message: 'Konnte Einladung nicht anlegen.' };
    }
  }
  if (!inserted) {
    return { ok: false, message: 'Konnte Einladung nicht anlegen.' };
  }

  const link = `${appUrl()}/${locale}/signup/buyer?code=${code}`;
  const base: CreateInvitationResult = {
    ok: true,
    message: 'Einladung erstellt.',
    code,
    link,
  };

  if (recipientEmail) {
    if (!emailEnabled()) {
      revalidatePath(`/${locale}/broker/invitations`);
      return {
        ...base,
        emailSent: false,
        emailError: 'E-Mail-Versand nicht konfiguriert (RESEND_API_KEY fehlt). Link bitte manuell teilen.',
      };
    }
    const broker = await loadBrokerContext(session.userId, session.email);
    const dispatch = await dispatchInvitationEmail({
      invitationId,
      code,
      recipientEmail,
      recipientName: label,
      locale,
      broker,
    });
    revalidatePath(`/${locale}/broker/invitations`);
    return dispatch.ok
      ? { ...base, emailSent: true, message: 'Einladung erstellt und versendet.' }
      : { ...base, emailSent: false, emailError: dispatch.error };
  }

  revalidatePath(`/${locale}/broker/invitations`);
  return base;
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

export interface ResendInvitationResult {
  ok: boolean;
  message: string;
}

/**
 * Broker action: resend an existing invitation email. Optionally accepts
 * a new email address — useful when the original address was a typo.
 */
export async function resendInvitationEmail(formData: FormData): Promise<ResendInvitationResult> {
  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) {
    return { ok: false, message: 'Nicht berechtigt.' };
  }
  if (!emailEnabled()) {
    return {
      ok: false,
      message: 'E-Mail-Versand nicht konfiguriert.',
    };
  }

  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { ok: false, message: 'Einladung nicht gefunden.' };

  const overrideRaw = String(formData.get('email') ?? '').trim();
  const overrideEmail = overrideRaw ? normaliseEmail(overrideRaw) : null;
  if (overrideEmail && !looksLikeEmail(overrideEmail)) {
    return { ok: false, message: 'E-Mail-Adresse ungültig.' };
  }
  const locale = String(formData.get('locale') ?? 'de');

  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const rl = await rateLimit(`invitation-resend:${session.userId}:${ip}`, RESEND_RATE_LIMIT_PER_HOUR, 3600);
  if (!rl.allowed) {
    return { ok: false, message: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  }

  const supabase = createSupabaseServerClient();
  const { data: inv, error } = await supabase
    .from('invitations')
    .select('id, code, label, email, max_uses, used_count, expires_at')
    .eq('id', id)
    .eq('org_id', session.orgId)
    .maybeSingle();
  if (error || !inv) {
    return { ok: false, message: 'Einladung nicht gefunden.' };
  }
  if (inv.max_uses != null && inv.used_count >= inv.max_uses) {
    return { ok: false, message: 'Code wurde bereits eingelöst.' };
  }
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
    return { ok: false, message: 'Code ist abgelaufen.' };
  }

  const target = overrideEmail ?? inv.email;
  if (!target) {
    return { ok: false, message: 'Für diese Einladung ist keine E-Mail-Adresse hinterlegt.' };
  }

  // Persist a new target address if the broker corrected it.
  if (overrideEmail && overrideEmail !== inv.email) {
    await supabase
      .from('invitations')
      .update({ email: overrideEmail })
      .eq('id', id);
  }

  const broker = await loadBrokerContext(session.userId, session.email);
  const dispatch = await dispatchInvitationEmail({
    invitationId: inv.id,
    code: inv.code,
    recipientEmail: target,
    recipientName: inv.label,
    locale,
    broker,
  });
  revalidatePath(`/${locale}/broker/invitations`);
  return dispatch.ok
    ? { ok: true, message: `Einladung erneut an ${target} versendet.` }
    : { ok: false, message: dispatch.error ?? 'Versand fehlgeschlagen.' };
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
