import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker } from '@/lib/mockData';
import { StatCard } from '@/components/StatCard';
import { StarRating } from '@/components/StarRating';
import { Logo } from '@/components/Logo';

export default async function BrokerReputationPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('broker');
  const conversion = Math.round(
    (mockBroker.reviews.total / mockBroker.reviews.requestsSent) * 100
  );

  const triggerSteps = t.raw('reputation.triggerSteps') as string[];

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
              <span className="text-brand-700">{t('nav.reputation')}</span>
              <Link href={`/${locale}/broker/curators`} className="hover:text-ink">
                {t('nav.curators')}
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
        <h1 className="text-3xl font-bold text-ink">{t('reputation.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('reputation.subtitle')}</p>

        {/* Pitch box */}
        <div className="card mt-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <p className="text-sm uppercase tracking-wide text-brand-100">
            Verkaufsargument im Sales-Pitch
          </p>
          <p className="mt-2 text-lg font-medium text-white">{t('reputation.pitch')}</p>
        </div>

        {/* Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label={t('reputation.metrics.totalReviews')}
            value={`${mockBroker.reviews.total}`}
            accent="emerald"
          />
          <StatCard
            label={t('reputation.metrics.averageStars')}
            value={`${mockBroker.reviews.average} / 5`}
            accent="amber"
          />
          <StatCard
            label={t('reputation.metrics.requestsSent')}
            value={`${mockBroker.reviews.requestsSent}`}
          />
          <StatCard
            label={t('reputation.metrics.conversion')}
            value={`${conversion}%`}
            accent="emerald"
          />
        </div>

        {/* Last review */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {t('reputation.lastReviewTitle')}
          </h2>
          <article className="card">
            <div className="flex items-center justify-between">
              <StarRating value={mockBroker.reviews.lastReviewStars} size="lg" />
              <a
                href={mockBroker.googleReviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Auf Google ansehen ↗
              </a>
            </div>
            <p className="mt-4 text-base italic text-ink-soft">
              &ldquo;{mockBroker.reviews.lastReviewText}&rdquo;
            </p>
            <div className="mt-4 text-xs text-ink-muted">
              Automatisch ausgelöst durch PropAfterCare · 7 Tage nach Einzug
            </div>
          </article>
        </section>

        {/* Trigger logic explanation */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {t('reputation.triggerTitle')}
          </h2>
          <ol className="space-y-3">
            {triggerSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-soft">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
