import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { getSession } from '@/lib/auth/getUser';
import { getBrokerForOrg } from '@/lib/data/brokers';
import { mockBroker } from '@/lib/mockData';
import { BrokerHeader } from '@/components/BrokerHeader';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { OnboardingGate } from '@/components/OnboardingGate';
import { ProfileCompletenessCard } from '@/components/ProfileCompletenessCard';
import { ToolChooser } from '@/components/ToolChooser';
import { readDemoBuyer } from '@/lib/demoBuyer';

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const tc = await getTranslations('common');
  const buyer = await getActiveBuyer();
  const session = await getSession();
  const isRealBuyer = session?.role === 'buyer' && !!session.orgId;
  const isDemoMode = !isRealBuyer && (await readDemoBuyer()) !== null;
  const broker = isRealBuyer
    ? (await getBrokerForOrg(session.orgId!)) ?? mockBroker
    : mockBroker;

  return (
    <main className="min-h-screen bg-slate-50">
      <DemoModeBanner locale={locale} />
      <BrokerHeader broker={broker} locale={locale} activeBuyerId={buyer.id} />
      {!isDemoMode && <OnboardingGate locale={locale} />}

      <div className="container-page py-10">
        <section className="card mb-8">
          <h1 className="text-3xl font-bold text-ink">
            {t('greeting', { name: buyer.name })}
          </h1>
          <p className="mt-1 text-ink-soft">{t('chooserLead')}</p>
        </section>

        <ToolChooser locale={locale} milestones={buyer.milestones} />

        <div className="mt-6">
          <ProfileCompletenessCard locale={locale} />
        </div>

        <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
      </div>
    </main>
  );
}
