import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

import { Logo } from '@/components/Logo';
import { readDemoBuyer } from '@/lib/demoBuyer';

import { startLiveDemoAction, resetLiveDemoAction } from './actions';

export default async function DemoStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('demoStart');

  const existing = await readDemoBuyer();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-ink-soft">
            <Logo variant="mark" className="h-6 w-6" />
            <span className="font-semibold text-ink">PropAfterCare</span>
            <span>·</span>
            <span>{t('eyebrow')}</span>
          </div>

          <div className="card">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{t('title')}</h1>
            <p className="mt-2 text-ink-soft">{t('subtitle')}</p>

            {existing && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <div className="flex-1">
                  <div className="font-medium">
                    {t('existingHeading', { name: existing.name })}
                  </div>
                  <div className="mt-0.5 text-xs text-emerald-800">{t('existingHint')}</div>
                </div>
                <Link href={`/${locale}/dashboard`} className="btn-primary py-1.5 text-xs">
                  {t('continueCta')}
                </Link>
              </div>
            )}

            {error === 'invalid' && (
              <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {t('errorInvalid')}
              </div>
            )}

            <form action={startLiveDemoAction} className="mt-6 space-y-4">
              <input type="hidden" name="locale" value={locale} />

              <label className="block">
                <span className="text-sm font-medium text-ink">{t('nameLabel')}</span>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={80}
                  defaultValue={existing?.name ?? ''}
                  className="input mt-1 w-full"
                  placeholder={t('namePlaceholder')}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">
                  {t('emailLabel')} <span className="text-ink-muted">({t('optional')})</span>
                </span>
                <input
                  type="email"
                  name="email"
                  maxLength={120}
                  defaultValue={existing?.email ?? ''}
                  className="input mt-1 w-full"
                  placeholder={t('emailPlaceholder')}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">{t('propertyTypeLabel')}</span>
                <select
                  name="propertyType"
                  required
                  defaultValue={existing?.propertyType ?? 'ownUse'}
                  className="input mt-1 w-full"
                >
                  <option value="ownUse">{t('propertyType.ownUse')}</option>
                  <option value="investment-self">{t('propertyType.investmentSelf')}</option>
                  <option value="investment-managed">{t('propertyType.investmentManaged')}</option>
                </select>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-ink">{t('cityLabel')}</span>
                  <input
                    type="text"
                    name="city"
                    required
                    maxLength={80}
                    defaultValue={existing?.city ?? 'Paderborn'}
                    className="input mt-1 w-full"
                    placeholder={t('cityPlaceholder')}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-ink">{t('moveInLabel')}</span>
                  <input
                    type="date"
                    name="moveInDate"
                    required
                    defaultValue={existing?.moveInDate ?? ''}
                    className="input mt-1 w-full"
                  />
                </label>
              </div>

              <button type="submit" className="btn-primary mt-2 w-full">
                {existing ? t('restartCta') : t('startCta')}
              </button>

              <p className="text-center text-xs text-ink-muted">{t('privacyNote')}</p>
            </form>

            {existing && (
              <form action={resetLiveDemoAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="w-full text-center text-xs text-ink-muted hover:text-ink"
                >
                  {t('clearCta')}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">{t('footerHint')}</p>
        </div>
      </div>
    </main>
  );
}
