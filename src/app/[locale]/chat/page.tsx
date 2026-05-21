import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';
import { BrokerHeader } from '@/components/BrokerHeader';
import { ChatInterface } from '@/components/ChatInterface';

export default async function ChatPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('chat');
  const tc = await getTranslations('common');
  const buyer = getDefaultBuyer();

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('intro')}</p>

          <div className="mt-8">
            <ChatInterface propertyType={buyer.propertyType} />
          </div>

          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <strong>Hinweis:</strong> {t('guardrail')}
          </p>
          <p className="mt-4 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
        </div>
      </div>
    </main>
  );
}
