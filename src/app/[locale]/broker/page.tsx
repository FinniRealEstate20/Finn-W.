import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, mockBuyers } from '@/lib/mockData';
import { progressFor } from '@/lib/milestones';
import { StatCard } from '@/components/StatCard';
import { ProgressBar } from '@/components/ProgressBar';

export default async function BrokerDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('broker');
  const totalMilestones = mockBuyers.reduce((sum, b) => sum + b.milestones.length, 0);
  const doneMilestones = mockBuyers.reduce(
    (sum, b) => sum + b.milestones.filter(m => m.status === 'done').length,
    0
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Broker top nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex items-center justify-between py-4">
          <Link href={`/${locale}`} className="text-lg font-bold tracking-tight text-ink">
            Prop<span className="text-brand-600">AfterCare</span>
            <span className="ml-2 text-xs font-medium text-ink-muted">Makler-Cockpit</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden gap-5 text-sm font-medium text-ink-soft sm:flex">
              <span className="text-brand-700">{t('nav.dashboard')}</span>
              <Link href={`/${locale}/broker/reputation`} className="hover:text-ink">
                {t('nav.reputation')}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Image
                src={mockBroker.photoUrl}
                alt={mockBroker.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="hidden text-sm font-medium text-ink sm:block">
                {mockBroker.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <h1 className="text-3xl font-bold text-ink">{t('dashboard.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('dashboard.subtitle')}</p>

        {/* Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label={t('dashboard.metrics.active')}
            value={`${mockBuyers.length}`}
          />
          <StatCard
            label={t('dashboard.metrics.milestonesDone')}
            value={`${doneMilestones}/${totalMilestones}`}
          />
          <StatCard
            label={t('dashboard.metrics.reviewsGenerated')}
            value={`${mockBroker.reviews.total}`}
            accent="emerald"
          />
          <StatCard
            label={t('dashboard.metrics.averageRating')}
            value={`${mockBroker.reviews.average} ★`}
            accent="amber"
          />
        </div>

        {/* Customer list */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {t('dashboard.customersTitle')}
          </h2>
          <div className="space-y-3">
            {mockBuyers.map(buyer => {
              const { percent, done, total } = progressFor(buyer.milestones);
              const currentPhase =
                buyer.milestones.find(m => m.status === 'in_progress')?.phase ??
                buyer.milestones.find(m => m.status === 'open')?.phase ??
                4;

              return (
                <article key={buyer.id} className="card">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-ink">{buyer.name}</h3>
                        <span className="chip">
                          {buyer.propertyType === 'investment'
                            ? 'Kapitalanlage'
                            : 'Eigennutzung'}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {t('dashboard.phase', { n: currentPhase })}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-ink-muted">
                        {buyer.address}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium text-ink">
                        {done}/{total} erledigt · {percent}%
                      </span>
                      <ProgressBar percent={percent} className="w-48" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
