import Link from 'next/link';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { Logo } from '@/components/Logo';

export default async function WelcomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('welcome');
  const tc = await getTranslations('common');
  const buyer = await getActiveBuyer();

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
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-muted">
              <span>{tc('poweredByShort')}</span>
              <Logo variant="mark" className="h-5 w-5" />
              <span className="font-medium text-ink-soft">PropAfterCare</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
