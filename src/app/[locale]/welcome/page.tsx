import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';

export default async function WelcomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('welcome');
  const tc = await getTranslations('common');
  const buyer = getDefaultBuyer();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-xl">
          <div className="card text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
              <Image
                src={mockBroker.photoUrl}
                alt={mockBroker.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold text-ink">
              {t('greeting', { name: buyer.name })}
            </h1>
            <p className="mt-4 text-ink-soft">{t('subtitle')}</p>
            <p className="mt-4 text-sm text-ink-muted">
              {t('brokerLine', { broker: mockBroker.name })}
            </p>
            <div className="mt-8">
              <Link href={`/${locale}/onboarding`} className="btn-primary w-full">
                {t('startCta')}
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-muted">{tc('poweredBy')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
