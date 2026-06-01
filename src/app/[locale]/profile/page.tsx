import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { BrokerHeader } from '@/components/BrokerHeader';
import { ProfileEditor } from '@/components/ProfileEditor';

export default async function ProfilePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');
  const td = await getTranslations('dashboard');
  const tc = await getTranslations('common');
  const buyer = await getActiveBuyer();

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} activeBuyerId={buyer.id} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}/dashboard`}
            className="text-xs font-medium text-ink-muted hover:text-ink-soft"
          >
            ← {td('greeting', { name: '' }).trim() || 'Dashboard'}
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('subtitle')}</p>

          <div className="mt-8">
            <ProfileEditor />
          </div>

          <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
        </div>
      </div>
    </main>
  );
}
