import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Logo } from '@/components/Logo';
import { PromoVideo } from '@/components/PromoVideo';

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('marketing');

  const features = t.raw('features.items') as Array<{ title: string; body: string }>;
  const tiers = t.raw('pricing.tiers') as Array<{
    name: string;
    price: string;
    deals: string;
    audience: string;
  }>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="container-page flex items-center justify-between py-4">
          <Link href={`/${locale}`} aria-label="PropAfterCare Startseite">
            <Logo variant="full" priority className="h-9" />
          </Link>
          <div className="hidden gap-7 text-sm font-medium text-ink-soft md:flex">
            <a href="#features" className="hover:text-ink">{t('nav.features')}</a>
            <a href="#pricing" className="hover:text-ink">{t('nav.pricing')}</a>
            <a href="#demo" className="hover:text-ink">{t('nav.demo')}</a>
          </div>
          <Link href={`/${locale}/broker`} className="btn-secondary py-2 text-xs">
            {t('nav.login')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="container-page pt-12 pb-10 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="chip mx-auto">{t('hero.eyebrow')}</div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-6 text-lg text-ink-soft sm:text-xl">{t('hero.subtitle')}</p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <PromoVideo />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={`/${locale}/dashboard`} className="btn-primary">
            {t('hero.ctaSecondary')}
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">{t('hero.trust')}</p>
      </section>

      {/* Pitch / Stats */}
      <section className="container-page pb-16">
        <div className="card mx-auto max-w-4xl bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('pitch.title')}</h2>
          <p className="mt-3 text-brand-50">{t('pitch.body')}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[1, 2, 3].map(n => (
              <div key={n}>
                <div className="text-4xl font-bold">{t(`pitch.stat${n}Value`)}</div>
                <div className="mt-1 text-sm text-brand-100">{t(`pitch.stat${n}Label`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-page py-16">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold text-ink">
          {t('features.title')}
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <article key={i} className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <span className="text-lg font-bold">{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section id="demo" className="container-page py-16">
        <div className="card mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-ink">{t('demo.title')}</h2>
          <p className="mt-2 text-ink-soft">{t('demo.subtitle')}</p>
          <Link href={`/${locale}/documents`} className="btn-primary mt-6">
            {t('demo.cta')}
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-ink">{t('pricing.title')}</h2>
          <p className="mt-2 text-ink-soft">{t('pricing.subtitle')}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <article
              key={tier.name}
              className={i === 1 ? 'card ring-2 ring-brand-500' : 'card'}
            >
              {i === 1 && (
                <span className="chip mb-3">Beliebt</span>
              )}
              <h3 className="text-lg font-semibold text-ink">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink">{tier.price}</span>
                <span className="text-sm text-ink-muted">/ Monat</span>
              </div>
              <p className="mt-3 text-sm text-ink-soft">{tier.deals}</p>
              <p className="text-sm text-ink-muted">{tier.audience}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm font-medium text-brand-700">
          {t('pricing.cta')}
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm text-ink-muted sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo variant="mark" className="h-7 w-7" />
            <span>{t('footer.tagline')}</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-ink">{t('footer.imprint')}</a>
            <a href="#" className="hover:text-ink">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-ink">{t('footer.terms')}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
