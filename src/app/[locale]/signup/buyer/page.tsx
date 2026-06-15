import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { BuyerSignupForm } from './BuyerSignupForm';
import { Logo } from '@/components/Logo';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface ValidatedInvitation {
  invitation_id: string;
  org_id: string;
  valid: boolean;
}

async function validateCode(code: string): Promise<ValidatedInvitation | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('validate_invitation', {
    code_input: code,
  });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : null;
  return (row ?? null) as ValidatedInvitation | null;
}

async function resolveBrokerForOrg(orgId: string): Promise<{ name: string; company: string | null } | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('broker_profiles')
    .select('full_name, company')
    .eq('org_id', orgId)
    .limit(1)
    .maybeSingle<{ full_name: string; company: string | null }>();
  if (!data) return null;
  return { name: data.full_name, company: data.company };
}

export default async function BuyerSignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { locale } = await params;
  const { code } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('auth.signupBuyer');

  const trimmed = (code ?? '').trim().toUpperCase();
  const validation = trimmed ? await validateCode(trimmed) : null;
  const broker =
    validation && validation.valid ? await resolveBrokerForOrg(validation.org_id) : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link
            href={`/${locale}`}
            className="mb-8 flex items-center justify-center gap-2 text-ink-soft"
          >
            <Logo variant="mark" className="h-7 w-7" />
            <span className="font-semibold">PropAfterCare</span>
          </Link>
          <div className="card">
            <h1 className="text-2xl font-bold text-ink">{t('title')}</h1>

            {!trimmed && (
              <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {t('missingCode')}
              </div>
            )}

            {trimmed && !validation && (
              <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {t('invalidCode')}
              </div>
            )}

            {trimmed && validation && !validation.valid && (
              <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {t('exhaustedCode')}
              </div>
            )}

            {trimmed && validation && validation.valid && (
              <>
                <p className="mt-2 text-sm text-ink-soft">
                  {broker
                    ? t('invitedByNamed', {
                        broker: broker.company || broker.name,
                      })
                    : t('invitedGeneric')}
                </p>
                <BuyerSignupForm locale={locale} code={trimmed} />
              </>
            )}

            <p className="mt-6 text-center text-xs text-ink-muted">{t('trustNote')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
