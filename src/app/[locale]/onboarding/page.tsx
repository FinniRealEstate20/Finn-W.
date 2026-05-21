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

  const profileOptions = [
    { value: 'ownUse', label: t('fields.propertyTypeOptions.ownUse'), hint: t('fields.propertyTypeOptions.ownUseHint'), checked: true },
    { value: 'investment-self', label: t('fields.propertyTypeOptions.investment-self'), hint: t('fields.propertyTypeOptions.investmentSelfHint'), checked: false },
    { value: 'investment-managed', label: t('fields.propertyTypeOptions.investment-managed'), hint: t('fields.propertyTypeOptions.investmentManagedHint'), checked: false }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('subtitle')}</p>

          <form className="card mt-8 space-y-6">
            <div>
              <label className="label" htmlFor="name">{t('fields.name')}</label>
              <input id="name" className="input" defaultValue={buyer.name} />
            </div>

            <div>
              <label className="label">{t('fields.propertyType')}</label>
              <div className="space-y-2">
                {profileOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition ${
                      opt.checked
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-brand-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value={opt.value}
                      defaultChecked={opt.checked}
                      className="mt-1 text-brand-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-ink">{opt.label}</div>
                      <div className="text-xs text-ink-muted">{opt.hint}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="moveIn">{t('fields.moveInDate')}</label>
                <input id="moveIn" type="date" className="input" defaultValue={buyer.moveInDate} />
              </div>
              <div>
                <label className="label" htmlFor="city">{t('fields.city')}</label>
                <input id="city" className="input" defaultValue="Paderborn" readOnly />
                <div className="mt-1 text-xs text-ink-muted">{t('fields.cityHint')}</div>
              </div>
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
