import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Logo } from '@/components/Logo';
import { PromoVideo } from '@/components/PromoVideo';
import { ToolChooser } from '@/components/ToolChooser';
import { getActiveBuyer } from '@/lib/activeBuyer';

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('marketing');
  const demoBuyer = await getActiveBuyer();

  const features = t.raw('features.items') as Array<{ title: string; body: string }>;

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
          <Link href={`/${locale}/login`} className="btn-secondary py-2 text-xs">
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

      {/* Demo: 3-Wege-Chooser, identisch zur eingeloggten Ansicht */}
      <section id="demo" className="container-page py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t('demo.title')}</h2>
            <p className="mt-2 text-ink-soft">{t('demo.subtitle')}</p>
          </div>
          <div className="mt-8">
            <ToolChooser
              locale={locale}
              milestones={demoBuyer.milestones}
              variant="demo"
            />
          </div>
        </div>
      </section>

      {/* Founder */}
      <section id="founder" className="bg-slate-900 text-white">
        <div className="container-page py-20 sm:py-28">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
            {/* Photo with Forbes-style text overlay */}
            <div className="md:col-span-7">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 shadow-2xl ring-1 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/founder.jpg"
                  alt={t('founder.bio')}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Dark gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent" />
                {/* Text overlay bottom-left */}
                <div className="absolute inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-10">
                  <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-300">
                    {t('founder.eyebrow')}
                  </div>
                  <h2 className="mt-3 font-black uppercase leading-[0.85] tracking-tight text-white text-5xl sm:text-7xl md:text-[5.5rem]">
                    <span className="block">{t('founder.overlayLine1')}</span>
                    <span className="block">{t('founder.overlayLine2')}</span>
                    <span className="block">{t('founder.overlayLine3')}</span>
                  </h2>
                  <div className="mt-5 max-w-[26ch] text-sm font-medium text-white/95 sm:text-base">
                    {t('founder.bio')}
                  </div>
                </div>
              </div>
            </div>

            {/* Story column */}
            <div className="md:col-span-5 md:self-center">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-300">
                {t('founder.kicker')}
              </div>
              <h3 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                {t('founder.headline')}
              </h3>
              <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
                {t('founder.body')}
              </p>
              <p className="mt-4 text-base leading-relaxed text-white sm:text-lg">
                {t('founder.bodyEmphasis')}
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-px w-10 bg-brand-400" />
                <p className="text-sm font-medium tracking-wide text-brand-300">
                  {t('founder.signoff')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — Preis auf Anfrage */}
      <section id="pricing" className="container-page py-16">
        <div className="card mx-auto max-w-2xl text-center">
          <span className="chip mx-auto">{t('pricing.chip')}</span>
          <h2 className="mt-4 text-3xl font-bold text-ink">{t('pricing.title')}</h2>
          <p className="mt-3 text-ink-soft">{t('pricing.body')}</p>
          <a
            href={`mailto:${t('pricing.contactEmail')}?subject=${encodeURIComponent(t('pricing.mailSubject'))}`}
            className="btn-primary mt-6 inline-block"
          >
            {t('pricing.cta')}
          </a>
          <p className="mt-4 text-xs text-ink-muted">{t('pricing.trust')}</p>
        </div>
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
