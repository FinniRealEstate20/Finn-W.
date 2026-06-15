import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth/getUser';
import { listOrgBuyers } from '@/lib/data/buyers';
import { getBrokerForOrg } from '@/lib/data/brokers';
import { mockBroker, mockBuyers } from '@/lib/mockData';
import { InteractiveBrokerList } from '@/components/InteractiveBrokerList';
import { Logo } from '@/components/Logo';

export default async function BrokerDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('broker');

  // For a signed-in broker, load real org data. For everyone else
  // (marketing visitor, demo viewer), keep the mock dashboard so the
  // pitch deck still tells a story end-to-end.
  const session = await getSession();
  const isRealBroker = session?.role === 'broker' && !!session.orgId;

  const broker = isRealBroker
    ? (await getBrokerForOrg(session.orgId!)) ?? mockBroker
    : mockBroker;
  const buyers = isRealBroker
    ? await listOrgBuyers(session.orgId!)
    : [...mockBuyers];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex items-center justify-between py-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3"
            aria-label="PropAfterCare Startseite"
          >
            <Logo variant="full" priority className="h-9" />
            <span className="hidden border-l border-slate-200 pl-3 text-xs font-medium text-ink-muted sm:block">
              Makler-Cockpit
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden gap-5 text-sm font-medium text-ink-soft sm:flex">
              <span className="text-brand-700">{t('nav.dashboard')}</span>
              <Link
                href={`/${locale}/broker/invitations`}
                className="hover:text-ink"
              >
                Einladungen
              </Link>
              <Link
                href={`/${locale}/broker/billing`}
                className="hover:text-ink"
              >
                Abo
              </Link>
              <Link
                href={`/${locale}/broker/reputation`}
                className="hover:text-ink"
              >
                {t('nav.reputation')}
              </Link>
              <Link
                href={`/${locale}/broker/curators`}
                className="hover:text-ink"
              >
                {t('nav.curators')}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Image
                src={broker.photoUrl}
                alt={broker.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="hidden text-sm font-medium text-ink sm:block">
                {broker.name}
              </span>
              {isRealBroker && (
                <form action="/api/auth/signout" method="POST" className="ml-2">
                  <input type="hidden" name="locale" value={locale} />
                  <button type="submit" className="text-xs text-ink-muted hover:text-ink">
                    Abmelden
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <h1 className="text-3xl font-bold text-ink">{t('dashboard.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('dashboard.subtitle')}</p>

        {isRealBroker && buyers.length === 0 ? (
          <div className="card mt-10 text-center">
            <h2 className="text-xl font-semibold text-ink">
              Noch keine Käufer
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Erstelle eine Einladung und sende den Link an deinen ersten Käufer.
            </p>
            <Link
              href={`/${locale}/broker/invitations`}
              className="btn-primary mt-6 inline-block"
            >
              Erste Einladung erstellen
            </Link>
          </div>
        ) : (
          <InteractiveBrokerList buyers={buyers} broker={broker} />
        )}
      </div>
    </main>
  );
}
