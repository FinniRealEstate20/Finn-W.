'use server';

import { headers } from 'next/headers';

import { rateLimit } from '@/lib/rateLimit';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const RATE_LIMIT_PER_HOUR = 5;

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

/**
 * Send a magic link for an existing user (login). Never creates a new user.
 */
export async function sendLoginLink(formData: FormData): Promise<ActionResult> {
  const email = normaliseEmail(String(formData.get('email') ?? ''));
  const locale = String(formData.get('locale') ?? 'de');

  if (!looksLikeEmail(email)) {
    return { ok: false, message: 'E-Mail-Adresse ungültig.' };
  }

  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const rl = await rateLimit(`login:${email}:${ip}`, RATE_LIMIT_PER_HOUR, 3600);
  if (!rl.allowed) {
    return {
      ok: false,
      message: 'Zu viele Anmeldeversuche. Bitte in einer Stunde erneut versuchen.',
    };
  }

  const supabase = createSupabaseServerClient();
  const redirectTo = `${appUrl()}/auth/callback?locale=${encodeURIComponent(locale)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
  });

  if (error) {
    // Don't reveal whether the email exists — generic success message.
    return {
      ok: true,
      message: 'Falls ein Konto existiert, ist der Anmelde-Link unterwegs.',
    };
  }
  return {
    ok: true,
    message: 'Falls ein Konto existiert, ist der Anmelde-Link unterwegs.',
  };
}

/**
 * Send a magic link that creates a new broker account on first use.
 * Name and company travel in user metadata; the callback finishes the
 * org bootstrap once the email has been confirmed.
 */
export async function signupBroker(formData: FormData): Promise<ActionResult> {
  const email = normaliseEmail(String(formData.get('email') ?? ''));
  const fullName = String(formData.get('full_name') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'de');

  if (!looksLikeEmail(email)) {
    return { ok: false, message: 'E-Mail-Adresse ungültig.' };
  }
  if (fullName.length < 2) {
    return { ok: false, message: 'Bitte vollständigen Namen angeben.' };
  }

  const ip = headers().get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const rl = await rateLimit(`signup:${ip}`, RATE_LIMIT_PER_HOUR, 3600);
  if (!rl.allowed) {
    return {
      ok: false,
      message: 'Zu viele Registrierungen von dieser Adresse. Später erneut versuchen.',
    };
  }

  const supabase = createSupabaseServerClient();
  const redirectTo = `${appUrl()}/auth/callback?locale=${encodeURIComponent(locale)}&intent=broker`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
      data: { intent: 'broker', full_name: fullName, company },
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

export async function signOut(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
}
