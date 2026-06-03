import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { formsFor, groupByCategory, documentCategories } from '@/lib/documents';
import { BrokerHeader } from '@/components/BrokerHeader';
import { DocumentItem } from '@/components/DocumentItem';
import { ExternalLinkIcon, FileTextIcon, LandmarkIcon } from '@/components/icons';

export default async function DocumentsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('documents');
  const tc = await getTranslations('common');
  const buyer = await getActiveBuyer();
  const forms = formsFor(buyer.propertyType);
  const grouped = groupByCategory(forms);

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} activeBuyerId={buyer.id} />
      <div className="container-page py-10">
        <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{t('subtitle')}</p>

        {/* Legende der drei Quelltypen */}
        <div className="card mt-6 flex flex-wrap gap-6 bg-white text-xs text-ink-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <FileTextIcon className="h-4 w-4" />
            </span>
            <div>
              <div className="font-semibold text-ink">{t('sourceType.inhouse')}</div>
              <div className="text-ink-muted">{t('sourceTypeHint.inhouse')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <ExternalLinkIcon className="h-4 w-4" />
            </span>
            <div>
              <div className="font-semibold text-ink">{t('sourceType.external_link')}</div>
              <div className="text-ink-muted">{t('sourceTypeHint.external_link')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
              <LandmarkIcon className="h-4 w-4" />
            </span>
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
