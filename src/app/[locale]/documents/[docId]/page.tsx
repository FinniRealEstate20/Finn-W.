import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';
import { documentCatalog } from '@/lib/documents';
import { BrokerHeader } from '@/components/BrokerHeader';
import type { DocumentId } from '@/types';

export default async function DocumentDetailPage({
  params
}: {
  params: Promise<{ locale: string; docId: string }>;
}) {
  const { locale, docId } = await params;
  setRequestLocale(locale);
  const doc = documentCatalog.find(d => d.id === docId);
  if (!doc) notFound();

  const t = await getTranslations('documents');
  const tc = await getTranslations('common');
  const buyer = getDefaultBuyer();

  // Demo: GEZ-Formular mit Auto-Fill (für alle Docs gleiches Schema im MVP)
  const fields = [
    { label: 'Vorname', value: buyer.name },
    { label: 'Nachname', value: 'Müller' },
    { label: 'Neue Adresse', value: buyer.address },
    { label: 'Alte Adresse', value: buyer.oldAddress },
    { label: 'E-Mail', value: buyer.email },
    { label: 'Einzugsdatum', value: buyer.moveInDate }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/${locale}/documents`}
            className="text-xs font-medium text-ink-muted hover:text-ink-soft"
          >
            ← {t('title')}
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-ink">
            {t(`items.${doc.id as DocumentId}.name`)}
          </h1>
          <p className="mt-2 text-ink-soft">
            {t(`items.${doc.id as DocumentId}.hint`)}
          </p>

          {doc.prefillable && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 16 16">
                <polyline points="3 8 6.5 11.5 13 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('prefilled')}
            </div>
          )}

          <form className="card mt-8 space-y-4">
            {fields.map((f, i) => (
              <div key={i}>
                <label className="label">{f.label}</label>
                <input className="input" defaultValue={f.value} />
              </div>
            ))}

            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <strong>Hinweis:</strong> {t('warning')}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="btn-primary flex-1">
                {t('actions.open')}
              </button>
              <button type="button" className="btn-secondary flex-1">
                {t('actions.download')}
              </button>
              {doc.externalUrl && (
                <a
                  href={doc.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex-1"
                >
                  {t('actions.external')} ↗
                </a>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
        </div>
      </div>
    </main>
  );
}
