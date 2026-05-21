import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { mockBroker, getDefaultBuyer } from '@/lib/mockData';
import { getForm, formatDate } from '@/lib/documents';
import { BrokerHeader } from '@/components/BrokerHeader';
import type { DocumentId } from '@/types';

const PROFILE_FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  birthDate: 'Geburtsdatum',
  newAddress: 'Neue Adresse',
  oldAddress: 'Alte Adresse',
  iban: 'IBAN',
  steuerId: 'Steuer-Identifikationsnummer',
  meterReading: 'Zählerstand'
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
  const buyer = getDefaultBuyer();

  const profileSample: Record<string, string> = {
    name: `${buyer.name} Müller`,
    birthDate: '12.03.1991',
    newAddress: buyer.address,
    oldAddress: buyer.oldAddress,
    iban: 'DE89 4006 0000 0123 4567 89',
    steuerId: '12 345 678 901',
    meterReading: '—'
  };

  const fields = (form.prefillCopyFields ?? ['name', 'newAddress']).map(key => ({
    label: PROFILE_FIELD_LABELS[key] ?? key,
    value: profileSample[key] ?? ''
  }));

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

          {/* Kontext nach Quelltyp */}
          {form.sourceType === 'external_link' && (
            <section className="card mt-8">
              <h2 className="text-sm font-semibold text-ink">{t('copyBox.title')}</h2>
              <p className="mt-1 text-xs text-ink-muted">
                Du wirst gleich zum offiziellen Portal weitergeleitet ({form.officialSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}). Hier deine Daten zum Kopieren:
              </p>
              <div className="mt-4 space-y-2">
                {fields.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-ink-muted">{f.label}</div>
                      <div className="text-sm font-medium text-ink">{f.value}</div>
                    </div>
                    <button type="button" className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50">
                      {t('copyBox.copy')}
                    </button>
                  </div>
                ))}
              </div>
              {form.externalUrl && (
                <a
                  href={form.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-6 w-full"
                >
                  {t('actions.external')} ↗
                </a>
              )}
            </section>
          )}

          {form.sourceType === 'inhouse' && (
            <section className="card mt-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 16 16">
                  <polyline points="3 8 6.5 11.5 13 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('prefilled')}
              </div>
              <div className="space-y-4">
                {fields.map((f, i) => (
                  <div key={i}>
                    <label className="label">{f.label}</label>
                    <input className="input" defaultValue={f.value} />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <strong>Hinweis:</strong> {t('warning')}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button type="button" className="btn-primary flex-1">
                  {t('actions.open')}
                </button>
                <button type="button" className="btn-secondary flex-1">
                  {t('actions.download')}
                </button>
              </div>
            </section>
          )}

          {form.sourceType === 'communal_pdf' && (
            <section className="card mt-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                🏛️ Offizielles Behörden-Formular
              </div>
              <p className="text-sm text-ink-soft">
                Wir füllen das offizielle PDF der Behörde mit deinen Profildaten aus. Du prüfst und reichst es selbst ein.
              </p>
              {form.sourceVersion && (
                <p className="mt-2 text-xs text-ink-muted">Formularstand: {form.sourceVersion}</p>
              )}
              <div className="mt-6 space-y-3">
                {fields.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="text-xs text-ink-muted">{f.label}</div>
                    <div className="text-sm font-medium text-ink">{f.value}</div>
                  </div>
                ))}
              </div>
              <button type="button" className="btn-primary mt-6 w-full">
                {t('actions.download')}
              </button>
            </section>
          )}

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
