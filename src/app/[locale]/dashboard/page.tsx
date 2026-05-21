import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';
import { milestonesByPhase, progressFor } from '@/lib/milestones';
import { BrokerHeader } from '@/components/BrokerHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { PhaseSection } from '@/components/PhaseSection';
import type { Phase } from '@/types';

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const tc = await getTranslations('common');
  const buyer = getDefaultBuyer();
  const grouped = milestonesByPhase(buyer.milestones);
  const { done, total, percent } = progressFor(buyer.milestones);
  const phases: Phase[] = [1, 2, 3, 4];

  const criticalOpen = buyer.milestones.find(
    m => m.status !== 'done' && m.isCriticalDeadline
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />

      <div className="container-page py-10">
        {/* Greeting + Progress */}
        <section className="card mb-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-ink">
                {t('greeting', { name: buyer.name })}
              </h1>
              <p className="mt-1 text-ink-soft">{t('todayLine')}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                {t('progress')}
              </div>
              <div className="text-2xl font-bold text-brand-600">{percent}%</div>
              <div className="text-xs text-ink-muted">
                {t('tasksDone', { done, total })}
              </div>
            </div>
          </div>
          <ProgressBar percent={percent} className="mt-5" />
        </section>

        {/* Critical-Deadline Banner */}
        {criticalOpen && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="text-2xl">⏰</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900">
                {t('criticalBanner', { days: criticalOpen.dueInDays ?? 14 })}
              </div>
              <div className="mt-0.5 text-xs text-red-800">
                Aufgabe: <strong>{criticalOpen.id}</strong> – wir erinnern dich bis es erledigt ist.
              </div>
            </div>
          </div>
        )}

        {/* Profile completeness card (Hybrid-Onboarding) */}
        {buyer.profileCompleteness < 100 && (
          <section className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600">
                👤
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">
                  {t('profileCard.title')}
                </div>
                <div className="text-xs text-ink-soft">{t('profileCard.subtitle')}</div>
                <div className="mt-2 w-40">
                  <ProgressBar percent={buyer.profileCompleteness} />
                </div>
                <div className="mt-1 text-[11px] font-medium text-brand-700">
                  {t('profileCard.completeness', { percent: buyer.profileCompleteness })}
                </div>
              </div>
            </div>
            <button className="btn-primary text-xs">{t('profileCard.cta')}</button>
          </section>
        )}

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {/* Phases */}
        <div className="space-y-10">
          {phases.map(p =>
            grouped[p].length > 0 ? (
              <PhaseSection key={p} phase={p} milestones={grouped[p]} />
            ) : null
          )}
        </div>

        <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
      </div>
    </main>
  );
}
