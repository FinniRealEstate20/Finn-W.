import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { BrokerHeader } from '@/components/BrokerHeader';
import { MyFormsView } from '@/components/MyFormsView';

export const dynamic = 'force-dynamic';

export default async function MyFormsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('myForms');
  const tc = await getTranslations('common');
  const buyer = await getActiveBuyer();

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} activeBuyerId={buyer.id} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/${locale}/dashboard`}
            className="text-xs font-medium text-ink-muted hover:text-ink-soft"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('subtitle')}</p>

          <div className="mt-8">
            <MyFormsView locale={locale} />
          </div>

          <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
        </div>
      </div>
    </main>
  );
}
