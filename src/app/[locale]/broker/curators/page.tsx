import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, topCurators } from '@/lib/mockData';
import { StatCard } from '@/components/StatCard';
import { Logo } from '@/components/Logo';

export default async function BrokerCuratorsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('broker');

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex items-center justify-between py-4">
          <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="PropAfterCare Startseite">
            <Logo variant="full" priority className="h-9" />
            <span className="hidden border-l border-slate-200 pl-3 text-xs font-medium text-ink-muted sm:block">
              Makler-Cockpit
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden gap-5 text-sm font-medium text-ink-soft sm:flex">
              <Link href={`/${locale}/broker`} className="hover:text-ink">
                {t('nav.dashboard')}
              </Link>
              <Link href={`/${locale}/broker/reputation`} className="hover:text-ink">
                {t('nav.reputation')}
              </Link>
              <span className="text-brand-700">{t('nav.curators')}</span>
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
        <h1 className="text-3xl font-bold text-ink">{t('curators.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('curators.subtitle')}</p>

        {/* Eigene Metriken */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={t('curators.yourPoints')}
            value={`${mockBroker.curatorPoints.currentQuarter}`}
            accent="brand"
          />
          <StatCard
            label={t('curators.totalConfirmed')}
            value={`${mockBroker.curatorPoints.totalConfirmed}`}
            accent="emerald"
          />
          <StatCard
            label={t('curators.yourRank')}
            value={`#${mockBroker.curatorPoints.rank}`}
            accent="amber"
          />
        </div>

        {/* Belohnungs-Stufen */}
        <section className="card mt-10">
          <h2 className="text-lg font-semibold text-ink">{t('curators.rewards.title')}</h2>
          <div className="mt-4 space-y-3">
            {[
              { tier: 3, label: t('curators.rewards.tier3'), reached: mockBroker.curatorPoints.currentQuarter >= 3 },
              { tier: 6, label: t('curators.rewards.tier6'), reached: mockBroker.curatorPoints.currentQuarter >= 6 },
              { tier: 9, label: t('curators.rewards.tier9'), reached: mockBroker.curatorPoints.currentQuarter >= 9 }
            ].map(r => (
              <div
                key={r.tier}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  r.reached
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    r.reached ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-ink-muted'
                  }`}
                >
                  {r.reached ? '✓' : r.tier}
                </div>
                <div className="text-sm text-ink-soft">{r.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bestenliste */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {t('curators.leaderboardTitle')}
          </h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Makler</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-muted">Punkte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCurators.map(c => {
                  const isYou = c.name === mockBroker.name;
                  return (
                    <tr key={c.rank} className={isYou ? 'bg-brand-50' : ''}>
                      <td className="px-4 py-3 text-ink-soft">
                        {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : c.rank}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">
                          {c.name} {isYou && <span className="text-xs text-brand-700">(du)</span>}
                        </div>
                        <div className="text-xs text-ink-muted">{c.company}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">{c.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
