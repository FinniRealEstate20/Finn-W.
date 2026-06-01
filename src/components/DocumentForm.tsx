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
  recordSubmission,
  type Submission
} from '@/lib/submissionStore';
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

function buildPrintableHtml(args: {
  title: string;
  subtitle: string;
  source: string;
  fields: Array<{ label: string; value: string }>;
  consequence?: string;
  receiptId: string;
}): string {
  const rows = args.fields
    .map(
      f => `
        <tr>
          <th>${escapeHtml(f.label)}</th>
          <td>${escapeHtml(f.value || '—')}</td>
        </tr>`
    )
    .join('');
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(args.title)}</title>
    <style>
      body { font-family: -apple-system, system-ui, Segoe UI, Roboto, sans-serif; color: #0f172a; max-width: 720px; margin: 32px auto; padding: 0 24px; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      .sub { color: #475569; font-size: 13px; margin-bottom: 24px; }
      .receipt { font-size: 11px; color: #64748b; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; vertical-align: top; }
      th { width: 38%; font-weight: 600; color: #334155; background: #f8fafc; }
      .footer { margin-top: 24px; font-size: 11px; color: #64748b; }
      .warn { margin-top: 16px; padding: 10px 12px; background: #fef3c7; color: #78350f; border-radius: 6px; font-size: 12px; }
      @media print { body { margin: 12mm; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(args.title)}</h1>
    <div class="sub">${escapeHtml(args.subtitle)}</div>
    <div class="receipt">Quelle: ${escapeHtml(args.source)} · Beleg-ID: ${escapeHtml(args.receiptId)}</div>
    <table>${rows}</table>
    ${args.consequence ? `<div class="warn">${escapeHtml(args.consequence)}</div>` : ''}
    <div class="footer">Erzeugt durch PropAfterCare · ${new Date().toLocaleString('de-DE')}</div>
    <script>window.onload = () => setTimeout(() => window.print(), 200);</script>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
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
    const html = buildPrintableHtml({
      title: t(`items.${form.id}.name`),
      subtitle: t(`items.${form.id}.hint`),
      source: sourceLabel,
      fields,
      consequence: form.consequenceIfMissing,
      receiptId: placeholder.receiptId
    });
    const win = window.open('', '_blank', 'noopener');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
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
    if (form.externalUrl) {
      window.open(form.externalUrl, '_blank', 'noopener,noreferrer');
    }
  }

  function markConfirmed() {
    const next = confirmSubmission(form.id);
    if (next) setSubmission(next);
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
