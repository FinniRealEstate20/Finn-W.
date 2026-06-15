import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LoginForm } from './LoginForm';
import { Logo } from '@/components/Logo';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; logout?: string }>;
}) {
  const { locale } = await params;
  const { error, logout } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  const banner = (() => {
    if (logout) return { tone: 'info' as const, text: t('login.banner.loggedOut') };
    if (!error) return null;
    switch (error) {
      case 'expired_link':
        return { tone: 'warn' as const, text: t('login.banner.expired') };
      case 'missing_code':
      case 'session_lost':
        return { tone: 'warn' as const, text: t('login.banner.invalid') };
      case 'org_bootstrap_failed':
      case 'profile_bootstrap_failed':
        return { tone: 'warn' as const, text: t('login.banner.bootstrap') };
      default:
        return { tone: 'warn' as const, text: t('login.banner.generic') };
    }
  })();

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
            <h1 className="text-2xl font-bold text-ink">{t('login.title')}</h1>
            <p className="mt-2 text-sm text-ink-soft">{t('login.subtitle')}</p>

            {banner && (
              <div
                role="status"
                className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                  banner.tone === 'warn'
                    ? 'bg-amber-50 text-amber-900'
                    : 'bg-emerald-50 text-emerald-900'
                }`}
              >
                {banner.text}
              </div>
            )}

            <LoginForm locale={locale} />

            <p className="mt-6 text-center text-sm text-ink-muted">
              {t('login.noAccount')}{' '}
              <Link
                href={`/${locale}/signup/broker`}
                className="font-medium text-brand-600 hover:underline"
              >
                {t('login.signupCta')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
