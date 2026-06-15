import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { BrokerHeader } from '@/components/BrokerHeader';
import { InteractiveDashboard } from '@/components/InteractiveDashboard';
import { OnboardingGate } from '@/components/OnboardingGate';
import { ProfileCompletenessCard } from '@/components/ProfileCompletenessCard';

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const tc = await getTranslations('common');
  const tm = await getTranslations('myForms');
  const buyer = await getActiveBuyer();

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} activeBuyerId={buyer.id} />
      <OnboardingGate locale={locale} />

      <div className="container-page py-10">
        <InteractiveDashboard buyer={buyer} locale={locale} />

        <ProfileCompletenessCard locale={locale} />

        {/* Quick Actions */}
        <div className="mb-8 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href={`/${locale}/documents`} className="card flex items-center gap-4 transition hover:border-brand-300 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h4m1-12H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-ink">{t('documents')}</div>
              <div className="text-sm text-ink-muted">17 Formulare für Paderborn</div>
            </div>
          </Link>
          <Link href={`/${locale}/my-forms`} className="card flex items-center gap-4 transition hover:border-brand-300 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-ink">{tm('navLink')}</div>
              <div className="text-sm text-ink-muted">Übersicht & versenden</div>
            </div>
          </Link>
          <Link href={`/${locale}/chat`} className="card flex items-center gap-4 transition hover:border-brand-300 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.96 9.96 0 0 1-4.906-1.286L3 20l1.395-3.72A8.001 8.001 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            </div>
            <div>
              <div className="font-semibold text-ink">{t('askAi')}</div>
              <div className="text-sm text-ink-muted">Verständlich, mit Paderborn-Bezug</div>
            </div>
          </Link>
        </div>

        <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
      </div>
    </main>
  );
}
