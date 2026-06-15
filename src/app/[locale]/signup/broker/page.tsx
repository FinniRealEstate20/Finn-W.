import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { BrokerSignupForm } from './BrokerSignupForm';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';

export default async function BrokerSignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ completed?: string }>;
}) {
  const { locale } = await params;
  const { completed } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

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
            <h1 className="text-2xl font-bold text-ink">{t('signupBroker.title')}</h1>
            <p className="mt-2 text-sm text-ink-soft">{t('signupBroker.subtitle')}</p>

            {completed && (
              <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {t('signupBroker.completedNotice')}
              </div>
            )}

            <BrokerSignupForm locale={locale} />

            <p className="mt-6 text-center text-sm text-ink-muted">
              {t('signupBroker.alreadyHaveAccount')}{' '}
              <Link
                href={`/${locale}/login`}
                className="font-medium text-brand-600 hover:underline"
              >
                {t('signupBroker.loginCta')}
              </Link>
            </p>
            <p className="mt-4 text-center text-xs text-ink-muted">
              {t('signupBroker.trustNote')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
