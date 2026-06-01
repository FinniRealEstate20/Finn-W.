import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker } from '@/lib/mockData';
import { getActiveBuyer } from '@/lib/activeBuyer';
import { getForm, formatDate } from '@/lib/documents';
import { BrokerHeader } from '@/components/BrokerHeader';
import { DocumentForm } from '@/components/DocumentForm';
import type { DocumentId } from '@/types';

const PROFILE_FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  birthDate: 'Geburtsdatum',
  newAddress: 'Neue Adresse',
  oldAddress: 'Alte Adresse',
  iban: 'IBAN',
  steuerId: 'Steuer-Identifikationsnummer',
  meterReading: 'Zählerstand',
  email: 'E-Mail',
  phone: 'Telefon'
};

export default async function DocumentDetailPage({
  params
}: {
  params: Promise<{ locale: string; docId: string }>;
}) {
  const { locale, docId } = await params;
  setRequestLocale(locale);
  const form = getForm(docId);
  if (!form) notFound();

  const t = await getTranslations('documents');
  const tc = await getTranslations('common');
  const buyer = await getActiveBuyer();

  const fieldKeys = form.prefillCopyFields ?? ['name', 'newAddress'];

  return (
    <main className="min-h-screen bg-slate-50">
      <BrokerHeader broker={mockBroker} locale={locale} activeBuyerId={buyer.id} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/${locale}/documents`}
            className="text-xs font-medium text-ink-muted hover:text-ink-soft"
          >
            ← {t('title')}
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-ink">
            {t(`items.${form.id as DocumentId}.name`)}
          </h1>
          <p className="mt-2 text-ink-soft">
            {t(`items.${form.id as DocumentId}.hint`)}
          </p>

          {/* Vertrauenszeile */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-ink-soft">
              {t(`sourceType.${form.sourceType}`)}
            </span>
            <span>
              {t('sourceLine', {
                source: form.officialSource.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
                date: formatDate(form.lastCheckedAt)
              })}
            </span>
          </div>

          {/* Meta-Karten */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="text-xs text-ink-muted">{t('meta.duration')}</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {form.estimatedTimeMin ? `${form.estimatedTimeMin} Min` : '—'}
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="text-xs text-ink-muted">{t('meta.cost')}</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {form.estimatedCost ?? '—'}
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <div className="text-xs text-ink-muted">{t('meta.processing')}</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {form.estimatedProcessing ?? '—'}
              </div>
            </div>
          </div>

          <DocumentForm
            form={form}
            fieldKeys={fieldKeys}
            fieldLabels={PROFILE_FIELD_LABELS}
          />

          {/* Submission-Info */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Einreichung
            </div>
            <div className="mt-1 text-sm font-medium text-ink">
              {t(`submission.${form.submissionMethod}`)}
            </div>
            {form.submissionTarget && (
              <div className="mt-1 text-xs text-ink-muted">{form.submissionTarget}</div>
            )}
            {form.consequenceIfMissing && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
                ⚠️ {form.consequenceIfMissing}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">
            <a href="#" className="hover:text-ink-soft">{t('reportOutdated')}</a>
          </p>
          <p className="mt-2 text-center text-xs text-ink-muted">{tc('disclaimer')}</p>
        </div>
      </div>
    </main>
  );
}
