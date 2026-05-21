import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';
import { BrokerHeader } from '@/components/BrokerHeader';

export default async function OnboardingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('onboarding');
  const buyer = getDefaultBuyer();

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('subtitle')}</p>

          <form className="card mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="name">{t('fields.name')}</label>
              <input id="name" className="input" defaultValue={buyer.name} />
            </div>

            <div>
              <label className="label">{t('fields.propertyType')}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-brand-500 bg-brand-50 px-4 py-3">
                  <input type="radio" name="propertyType" defaultChecked className="text-brand-600" />
                  <span className="text-sm font-medium text-ink">
                    {t('fields.propertyTypeOptions.ownUse')}
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3">
                  <input type="radio" name="propertyType" className="text-brand-600" />
                  <span className="text-sm font-medium text-ink">
                    {t('fields.propertyTypeOptions.investment')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="moveIn">{t('fields.moveInDate')}</label>
              <input id="moveIn" type="date" className="input" defaultValue={buyer.moveInDate} />
            </div>

            <div>
              <label className="label" htmlFor="city">{t('fields.city')}</label>
              <input id="city" className="input" defaultValue={buyer.city} />
            </div>

            <Link href={`/${locale}/dashboard`} className="btn-primary w-full">
              {t('submit')}
            </Link>
          </form>
        </div>
      </div>
    </main>
  );
}
