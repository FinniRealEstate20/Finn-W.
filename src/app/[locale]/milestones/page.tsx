import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

import { getActiveBuyer } from '@/lib/activeBuyer';
import { getSession } from '@/lib/auth/getUser';
import { getBrokerForOrg } from '@/lib/data/brokers';
import { mockBroker } from '@/lib/mockData';
import { BrokerHeader } from '@/components/BrokerHeader';
import { InteractiveDashboard } from '@/components/InteractiveDashboard';

export default async function MilestonesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('milestonesPage');
  const tc = await getTranslations('common');

  const buyer = await getActiveBuyer();
  const session = await getSession();
  const isRealBuyer = session?.role === 'buyer' && !!session.orgId;

  const broker = isRealBuyer
    ? (await getBrokerForOrg(session!.orgId!)) ?? mockBroker
    : mockBroker;

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={broker} locale={locale} activeBuyerId={buyer.id} />

      <div className="container-page py-10">
        <div className="mb-6">
          <Link
            href={`/${locale}/dashboard`}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            {t('backToOverview')}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-soft">{t('subtitle')}</p>
        </div>

        <InteractiveDashboard
          buyer={buyer}
          locale={locale}
          enableServerSync={isRealBuyer}
        />

        <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
      </div>
    </main>
  );
}
