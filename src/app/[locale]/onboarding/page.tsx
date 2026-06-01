import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { BrokerHeader } from '@/components/BrokerHeader';
import { OnboardingForm } from '@/components/OnboardingForm';

export default async function OnboardingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('onboarding');
  const buyer = await getActiveBuyer();

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} activeBuyerId={buyer.id} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('subtitle')}</p>
          <OnboardingForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
