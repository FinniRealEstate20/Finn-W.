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

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />

      <div className="container-page py-10">
        {/* Greeting + Progress */}
        <section className="card mb-8">
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

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href={`/${locale}/documents`} className="card hover:border-brand-300 hover:shadow-lg transition flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h4m1-12H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-ink">{t('documents')}</div>
              <div className="text-sm text-ink-muted">Vorausgefüllte Formulare</div>
            </div>
          </Link>
          <Link href={`/${locale}/chat`} className="card hover:border-brand-300 hover:shadow-lg transition flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.96 9.96 0 0 1-4.906-1.286L3 20l1.395-3.72A8.001 8.001 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-ink">{t('askAi')}</div>
              <div className="text-sm text-ink-muted">In deiner Sprache, jederzeit</div>
            </div>
          </Link>
        </div>

        {/* Phases */}
        <div className="space-y-10">
          {phases.map(p => (
            <PhaseSection key={p} phase={p} milestones={grouped[p]} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
      </div>
    </main>
  );
}
