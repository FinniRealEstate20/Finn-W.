'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formCatalog } from '@/lib/documents';
import { loadProfile, formatAddress } from '@/lib/profileStore';
import {
  confirmSubmission,
  fetchServerSubmissions,
  loadSubmissions,
  type Submission,
  type SubmissionStatus
} from '@/lib/submissionStore';
import { buildSubmissionPdf, downloadPdf } from '@/lib/pdf';
import type { FillAuditEntry, FillSource } from '@/lib/fillAudit';
import type { DocumentId, FormEntry } from '@/types';
import { CheckIcon } from './icons';

type StatusFilter = 'all' | SubmissionStatus;
type SortKey = 'newest' | 'oldest' | 'category' | 'status';

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  draft: 'bg-slate-100 text-ink-soft ring-slate-200',
  submitted: 'bg-sky-50 text-sky-700 ring-sky-100',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  failed: 'bg-red-50 text-red-700 ring-red-100'
};

const STATUS_ORDER: SubmissionStatus[] = ['draft', 'submitted', 'confirmed', 'failed'];

interface Row {
  submission: Submission;
  form: FormEntry;
}

function buildRows(submissions: Record<string, Submission>): Row[] {
  const rows: Row[] = [];
  for (const submission of Object.values(submissions)) {
    const form = formCatalog.find(f => f.id === submission.formId);
    if (form) rows.push({ submission, form });
  }
  return rows;
}

function sortRows(rows: Row[], by: SortKey): Row[] {
  const copy = [...rows];
  switch (by) {
    case 'oldest':
      return copy.sort(
        (a, b) =>
          new Date(a.submission.submittedAt).getTime() -
          new Date(b.submission.submittedAt).getTime()
      );
    case 'category':
      return copy.sort((a, b) => a.form.category.localeCompare(b.form.category));
    case 'status':
      return copy.sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.submission.status) -
          STATUS_ORDER.indexOf(b.submission.status)
      );
    case 'newest':
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.submission.submittedAt).getTime() -
          new Date(a.submission.submittedAt).getTime()
      );
  }
}

const FIELD_LABEL: Record<string, string> = {
  name: 'Name',
  birthDate: 'Geburtsdatum',
  newAddress: 'Neue Adresse',
  oldAddress: 'Alte Adresse',
  iban: 'IBAN',
  steuerId: 'Steuer-ID',
  meterReading: 'Zählerstand',
  email: 'E-Mail',
  phone: 'Telefon'
};

export function MyFormsView({ locale }: { locale: string }) {
  const t = useTranslations('myForms');
  const td = useTranslations('documents');
  const [hydrated, setHydrated] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  useEffect(() => {
    setRows(buildRows(loadSubmissions()));
    setHydrated(true);
    fetchServerSubmissions().then(({ merged, added }) => {
      if (merged > 0 || added > 0) {
        setRows(buildRows(loadSubmissions()));
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const f = filter === 'all' ? rows : rows.filter(r => r.submission.status === filter);
    return sortRows(f, sort);
  }, [rows, filter, sort]);

  const stats = useMemo(() => {
    const initial: Record<SubmissionStatus, number> = {
      draft: 0,
      submitted: 0,
      confirmed: 0,
      failed: 0
    };
    for (const r of rows) initial[r.submission.status] += 1;
    return initial;
  }, [rows]);

  function confirm(id: DocumentId) {
    const next = confirmSubmission(id);
    if (next) {
      setRows(prev =>
        prev.map(r => (r.submission.formId === id ? { ...r, submission: next } : r))
      );
    }
  }

  function generatePdf(row: Row) {
    const profile = loadProfile();
    const fields = (row.form.prefillCopyFields ?? ['name', 'newAddress']).map(key => ({
      label: FIELD_LABEL[key] ?? key,
      value: resolveValue(row.submission.data, profile, key)
    }));
    const blob = buildSubmissionPdf({
      title: td(`items.${row.form.id}.name`),
      subtitle: td(`items.${row.form.id}.hint`),
      source: row.form.officialSource.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      receiptId: row.submission.receiptId,
      fields,
      consequence: row.form.consequenceIfMissing,
      submissionTarget: row.form.submissionTarget,
      buyerName: `${profile.firstName} ${profile.lastName}`.trim(),
      fillAudit: row.submission.fillAudit,
      fillSummary: row.submission.fillSummary,
      fillReceiptAt: row.submission.fillReceiptAt
    });
    downloadPdf(blob, `${row.form.id}-${row.submission.receiptId}.pdf`);
  }

  function sendForm(row: Row) {
    const formName = td(`items.${row.form.id}.name`);
    const subject = t('mailSubject', { form: formName });
    const profile = loadProfile();
    const lines = (row.form.prefillCopyFields ?? ['name', 'newAddress'])
      .map(k => `${FIELD_LABEL[k] ?? k}: ${resolveValue(row.submission.data, profile, k)}`)
      .join('\n');
    const intro = t('mailIntro', { form: formName });
    const body = `${intro}${lines}\n\nMit freundlichen Grüßen\n${profile.firstName} ${profile.lastName}`;

    switch (row.form.submissionMethod) {
      case 'email': {
        const to = row.form.submissionTarget ?? '';
        const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
        return;
      }
      case 'online_portal': {
        if (row.form.externalUrl) {
          window.open(row.form.externalUrl, '_blank', 'noopener,noreferrer');
        }
        return;
      }
      case 'postal':
      case 'in_person':
      default:
        generatePdf(row);
    }
  }

  function actionLabelFor(form: FormEntry): string {
    switch (form.submissionMethod) {
      case 'email':
        return t('actions.mailto');
      case 'online_portal':
        return t('actions.external');
      case 'postal':
        return t('actions.postal');
      case 'in_person':
        return t('actions.inperson');
      default:
        return t('actions.send');
    }
  }

  if (!hydrated) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-12 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-sm text-ink-soft">{t('empty')}</p>
        <Link
          href={`/${locale}/documents`}
          className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {t('browseLink')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill label={t('stats.total')} value={rows.length} />
        <StatPill label={t('stats.drafts')} value={stats.draft} />
        <StatPill label={t('stats.submitted')} value={stats.submitted} />
        <StatPill label={t('stats.confirmed')} value={stats.confirmed} accent="emerald" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-full bg-slate-100 p-1 text-xs">
          {(['all', 'draft', 'submitted', 'confirmed'] as const).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1 font-medium transition ${
                filter === key ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t(`filters.${key}`)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Sortierung:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-ink"
          >
            <option value="newest">{t('sort.newest')}</option>
            <option value="oldest">{t('sort.oldest')}</option>
            <option value="category">{t('sort.category')}</option>
            <option value="status">{t('sort.status')}</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-ink-muted">
          Keine Formulare in dieser Auswahl.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(row => (
            <li key={row.submission.formId} className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">
                      {td(`items.${row.form.id}.name`)}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                        STATUS_BADGE[row.submission.status]
                      }`}
                    >
                      {t(`filters.${row.submission.status}`)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-ink-muted">
                      {td(`categories.${row.form.category}`)}
                    </span>
                    {row.submission.fillAudit && row.submission.fillAudit.length > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                        Smart-Fill-Quittung
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {t('receiptLabel', { id: row.submission.receiptId })} ·{' '}
                    {new Date(row.submission.submittedAt).toLocaleString('de-DE')}
                  </p>
                  {row.submission.serverReceiptId && (
                    <p className="text-[11px] text-ink-muted">
                      Server-Beleg <span className="font-mono">{row.submission.serverReceiptId}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/documents/${row.form.id}`}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    {t('actions.open')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => generatePdf(row)}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                  >
                    {t('actions.pdf')}
                  </button>
                  <button
                    type="button"
                    onClick={() => sendForm(row)}
                    className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    {actionLabelFor(row.form)}
                  </button>
                  {row.submission.status !== 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => confirm(row.submission.formId)}
                      aria-label="Als erledigt markieren"
                      className="inline-flex items-center justify-center rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                    >
                      <CheckIcon className="h-4 w-4" strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
              <FillAuditPanel submission={row.submission} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SOURCE_STYLE: Record<FillSource, { bg: string; fg: string; label: string }> = {
  recipe: { bg: 'bg-emerald-50 ring-emerald-200', fg: 'text-emerald-700', label: 'Recipe' },
  ai: { bg: 'bg-purple-50 ring-purple-200', fg: 'text-purple-700', label: 'KI-ergänzt' },
  failed: { bg: 'bg-amber-50 ring-amber-200', fg: 'text-amber-800', label: 'Nicht gefunden' }
};

function FillAuditPanel({ submission }: { submission: Submission }) {
  const audit = submission.fillAudit;
  if (!audit || audit.length === 0) {
    return (
      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-ink-muted">
        Manuell ausgefüllt — keine Smart-Fill-Quittung.
      </p>
    );
  }
  const summary = submission.fillSummary;
  return (
    <details className="group mt-3 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer list-none text-xs font-semibold text-emerald-700 hover:text-emerald-800">
        <span className="inline-flex items-center gap-1">
          Smart-Fill-Quittung ansehen
          <span className="text-ink-muted font-normal">
            ({audit.length} {audit.length === 1 ? 'Eintrag' : 'Einträge'}
            {summary ? ` · ${summary.filled} von ${summary.total} gefüllt` : ''})
          </span>
          <svg className="h-3 w-3 transition group-open:rotate-180" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-slate-200">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-50 text-ink-muted">
            <tr>
              <th className="px-3 py-1.5 text-left font-medium">Feld</th>
              <th className="px-3 py-1.5 text-left font-medium">Wert</th>
              <th className="px-3 py-1.5 text-left font-medium">Quelle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {audit.map((entry: FillAuditEntry, i: number) => {
              const style = SOURCE_STYLE[entry.source];
              return (
                <tr key={`${entry.profileKey}-${i}`} className="align-top">
                  <td className="px-3 py-2 text-ink">{entry.label}</td>
                  <td className="px-3 py-2">
                    <div className="text-ink">{entry.value || '—'}</div>
                    {entry.selector && (
                      <div className="mt-0.5 break-all font-mono text-[10px] text-ink-muted">
                        {entry.selector}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${style.bg} ${style.fg}`}
                      title={
                        entry.source === 'recipe'
                          ? 'Aus dem Standard-Selektor des Recipes'
                          : entry.source === 'ai'
                            ? 'KI-Mapper hat den Selektor erraten'
                            : 'Feld konnte nicht ausgefüllt werden'
                      }
                    >
                      {style.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {submission.fillReceiptAt && (
        <p className="mt-2 text-[10px] text-ink-muted">
          Quittung erstellt am {new Date(submission.fillReceiptAt).toLocaleString('de-DE')}
        </p>
      )}
    </details>
  );
}

function StatPill({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent?: 'emerald';
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ring-1 ${
        accent === 'emerald'
          ? 'bg-emerald-50 text-emerald-900 ring-emerald-100'
          : 'bg-white text-ink ring-slate-200'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function resolveValue(
  data: Record<string, string>,
  profile: ReturnType<typeof loadProfile>,
  key: string
): string {
  if (data[key]) return data[key];
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
