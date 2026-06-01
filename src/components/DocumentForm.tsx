'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  formatAddress,
  loadProfile,
  saveProfile,
  type ProfileData
} from '@/lib/profileStore';
import {
  confirmSubmission,
  getSubmission,
  pushSubmissionToServer,
  recordSubmission,
  type Submission
} from '@/lib/submissionStore';
import { buildSubmissionPdf, downloadPdf } from '@/lib/pdf';
import type { FormEntry } from '@/types';

interface Props {
  form: FormEntry;
  fieldKeys: readonly string[];
  fieldLabels: Record<string, string>;
}

function valueFromProfile(profile: ProfileData, key: string): string {
  switch (key) {
    case 'name':
      return `${profile.firstName} ${profile.lastName}`.trim();
    case 'birthDate':
      return profile.birthDate;
    case 'newAddress':
      return formatAddress(profile.newAddress);
    case 'oldAddress':
      return formatAddress(profile.oldAddress);
    case 'iban':
      return profile.iban;
    case 'steuerId':
      return profile.steuerId;
    case 'meterReading':
      return profile.meterReadingElectricity || profile.meterReadingGas || '—';
    case 'email':
      return profile.email;
    case 'phone':
      return profile.phone;
    default:
      return '';
  }
}

function setValueOnProfile(profile: ProfileData, key: string, raw: string): ProfileData {
  switch (key) {
    case 'name': {
      const [first = '', ...rest] = raw.split(' ');
      return { ...profile, firstName: first, lastName: rest.join(' ') };
    }
    case 'birthDate':
      return { ...profile, birthDate: raw };
    case 'iban':
      return { ...profile, iban: raw };
    case 'steuerId':
      return { ...profile, steuerId: raw };
    case 'email':
      return { ...profile, email: raw };
    case 'phone':
      return { ...profile, phone: raw };
    case 'meterReading':
      return { ...profile, meterReadingElectricity: raw };
    default:
      return profile;
  }
}

function buyerName(profile: ProfileData | null): string | undefined {
  if (!profile) return undefined;
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  return name.length > 0 ? name : undefined;
}

export function DocumentForm({ form, fieldKeys, fieldLabels }: Props) {
  const t = useTranslations('documents');
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    const initial: Record<string, string> = {};
    for (const k of fieldKeys) initial[k] = valueFromProfile(p, k);
    setValues(initial);
    setSubmission(getSubmission(form.id) ?? null);
    setHydrated(true);
  }, [form.id, fieldKeys]);

  const sourceLabel = useMemo(
    () =>
      form.officialSource
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, ''),
    [form.officialSource]
  );

  function updateValue(key: string, raw: string) {
    setValues(prev => ({ ...prev, [key]: raw }));
    if (profile) {
      const next = setValueOnProfile(profile, key, raw);
      setProfile(next);
      saveProfile(next);
    }
  }

  async function copyField(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(c => (c === label ? null : c)), 1400);
    } catch {
      // ignore – clipboard not available
    }
  }

  function readActiveBuyerId(): string | undefined {
    const match = document.cookie
      .split('; ')
      .find(c => c.startsWith('pac-active-buyer='));
    return match ? decodeURIComponent(match.split('=')[1]) : undefined;
  }

  function syncToServer(record: Submission) {
    const buyerId = readActiveBuyerId();
    void pushSubmissionToServer(record, {
      id: buyerId,
      email: profile?.email
    }).then(synced => setSubmission(synced));
  }

  function openPrintable() {
    const fields = fieldKeys.map(k => ({
      label: fieldLabels[k] ?? k,
      value: values[k] ?? ''
    }));
    const placeholder = recordSubmission({
      formId: form.id,
      channel: form.sourceType === 'communal_pdf' ? 'communal_pdf' : 'inhouse',
      data: values,
      source: form.officialSource,
      status: 'draft'
    });
    setSubmission(placeholder);
    syncToServer(placeholder);
    try {
      const blob = buildSubmissionPdf({
        title: t(`items.${form.id}.name`),
        subtitle: t(`items.${form.id}.hint`),
        source: sourceLabel,
        fields,
        consequence: form.consequenceIfMissing,
        submissionTarget: form.submissionTarget,
        receiptId: placeholder.receiptId,
        buyerName: buyerName(profile)
      });
      downloadPdf(blob, `${form.id}-${placeholder.receiptId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  }

  function submitInhouse() {
    const next = recordSubmission({
      formId: form.id,
      channel: 'inhouse',
      data: values,
      source: form.officialSource,
      status: 'submitted'
    });
    setSubmission(next);
    syncToServer(next);
  }

  function openExternal() {
    const next = recordSubmission({
      formId: form.id,
      channel: 'external_link',
      data: values,
      source: form.officialSource,
      status: 'submitted'
    });
    setSubmission(next);
    syncToServer(next);
    if (form.externalUrl) {
      window.open(form.externalUrl, '_blank', 'noopener,noreferrer');
    }
  }

  function markConfirmed() {
    const next = confirmSubmission(form.id);
    if (next) {
      setSubmission(next);
      syncToServer(next);
    }
  }

  if (!hydrated) {
    return (
      <section className="card mt-8 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {fieldKeys.map(k => (
            <div key={k} className="h-9 rounded bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  const fields = fieldKeys.map(k => ({
    key: k,
    label: fieldLabels[k] ?? k,
    value: values[k] ?? ''
  }));

  return (
    <>
      {submission && (
        <div
          className={`mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${
            submission.status === 'confirmed'
              ? 'bg-emerald-50 text-emerald-900 ring-emerald-100'
              : submission.status === 'draft'
                ? 'bg-slate-50 text-ink-soft ring-slate-200'
                : 'bg-sky-50 text-sky-900 ring-sky-100'
          }`}
        >
          <div>
            <div className="font-semibold">
              {submission.status === 'confirmed'
                ? 'Erledigt ✓'
                : submission.status === 'draft'
                  ? 'Entwurf gespeichert'
                  : 'Eingereicht'}
            </div>
            <div className="text-xs">
              Beleg-ID {submission.receiptId} ·{' '}
              {new Date(submission.submittedAt).toLocaleString('de-DE')}
              {submission.serverReceiptId && (
                <>
                  {' '}
                  · Server-Beleg <span className="font-mono">{submission.serverReceiptId}</span>
                </>
              )}
              {submission.serverError && !submission.serverReceiptId && (
                <span className="ml-2 text-amber-700">(offline gespeichert)</span>
              )}
            </div>
          </div>
          {submission.status !== 'confirmed' && (
            <button
              type="button"
              onClick={markConfirmed}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
            >
              Als erledigt markieren
            </button>
          )}
        </div>
      )}

      {form.sourceType === 'external_link' && (
        <section className="card mt-8">
          <h2 className="text-sm font-semibold text-ink">{t('copyBox.title')}</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Du wirst gleich zum offiziellen Portal weitergeleitet ({sourceLabel}). Hier deine Daten zum Kopieren:
          </p>
          <div className="mt-4 space-y-2">
            {fields.map(f => (
              <div
                key={f.key}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-ink-muted">{f.label}</div>
                  <div className="truncate text-sm font-medium text-ink">{f.value || '—'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyField(f.label, f.value)}
                  className="ml-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50"
                >
                  {copied === f.label ? t('copyBox.copied') : t('copyBox.copy')}
                </button>
              </div>
            ))}
          </div>
          {form.externalUrl && (
            <button type="button" onClick={openExternal} className="btn-primary mt-6 w-full">
              {t('actions.external')} ↗
            </button>
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
            {fields.map(f => (
              <div key={f.key}>
                <label className="label" htmlFor={`field-${f.key}`}>{f.label}</label>
                <input
                  id={`field-${f.key}`}
                  className="input"
                  value={f.value}
                  onChange={e => updateValue(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <strong>Hinweis:</strong> {t('warning')}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={submitInhouse} className="btn-primary flex-1">
              {t('actions.open')}
            </button>
            <button type="button" onClick={openPrintable} className="btn-secondary flex-1">
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
            {fields.map(f => (
              <div
                key={f.key}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="text-xs text-ink-muted">{f.label}</div>
                <div className="text-sm font-medium text-ink">{f.value || '—'}</div>
              </div>
            ))}
          </div>
          <button type="button" onClick={openPrintable} className="btn-primary mt-6 w-full">
            {t('actions.download')}
          </button>
        </section>
      )}
    </>
  );
}
