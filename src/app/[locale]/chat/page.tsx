import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker } from '@/lib/mockData';
import { BrokerHeader } from '@/components/BrokerHeader';

export default async function ChatPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('chat');
  const tc = await getTranslations('common');

  const suggested = t.raw('suggested') as string[];

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-2 text-ink-soft">{t('intro')}</p>

          <div className="card mt-8 space-y-4">
            {/* Assistant message */}
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                KI
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-ink">
                Hallo! Was beschäftigt dich gerade rund um deinen neuen Wohnsitz?
              </div>
            </div>

            {/* Suggested questions */}
            <div className="ml-11 flex flex-wrap gap-2">
              {suggested.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-ink-soft transition hover:border-brand-300 hover:text-brand-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form className="mt-6 flex gap-2">
            <input className="input flex-1" placeholder={t('placeholder')} />
            <button type="button" className="btn-primary">{t('send')}</button>
          </form>

          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <strong>Hinweis:</strong> {t('guardrail')}
          </p>
          <p className="mt-4 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
        </div>
      </div>
    </main>
  );
}
