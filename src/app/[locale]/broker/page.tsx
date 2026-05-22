import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, mockBuyers } from '@/lib/mockData';
import { InteractiveBrokerList } from '@/components/InteractiveBrokerList';

export default async function BrokerDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('broker');

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
        <h1 className="text-3xl font-bold text-ink">{t('dashboard.title')}</h1>
        <p className="mt-1 text-ink-soft">{t('dashboard.subtitle')}</p>

        <InteractiveBrokerList
          buyers={[...mockBuyers]}
          broker={mockBroker}
        />
      </div>
    </main>
  );
}
