import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';
import { formsFor, groupByCategory, documentCategories } from '@/lib/documents';
import { BrokerHeader } from '@/components/BrokerHeader';
import { DocumentItem } from '@/components/DocumentItem';

export default async function DocumentsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('documents');
  const tc = await getTranslations('common');
  const buyer = getDefaultBuyer();
  const forms = formsFor(buyer.propertyType);
  const grouped = groupByCategory(forms);

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />
      <div className="container-page py-10">
        <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t('subtitle')}</p>

        {/* Legende der drei Quelltypen */}
        <div className="card mt-6 flex flex-wrap gap-4 bg-white text-xs text-ink-soft">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <div>
              <div className="font-semibold text-ink">{t('sourceType.inhouse')}</div>
              <div className="text-ink-muted">{t('sourceTypeHint.inhouse')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🔗</span>
            <div>
              <div className="font-semibold text-ink">{t('sourceType.external_link')}</div>
              <div className="text-ink-muted">{t('sourceTypeHint.external_link')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏛️</span>
            <div>
              <div className="font-semibold text-ink">{t('sourceType.communal_pdf')}</div>
              <div className="text-ink-muted">{t('sourceTypeHint.communal_pdf')}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {documentCategories.map(cat => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="mb-4 text-lg font-semibold text-ink">
                  {t(`categories.${cat}`)}
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {items.map(form => (
                    <DocumentItem key={form.id} form={form} locale={locale} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <p className="mt-12 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
      </div>
    </main>
  );
}
