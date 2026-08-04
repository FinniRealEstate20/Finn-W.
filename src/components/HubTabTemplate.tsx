'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  loadProfile,
  saveProfile,
  type ProfileData
} from '@/lib/profileStore';
import { valueFromProfile, setValueOnProfile } from '@/lib/portalMapping';
import { computeDeadline } from '@/lib/fristen';
import {
  confirmSubmission,
  getSubmission,
  pushSubmissionToServer,
  recordSubmission,
  type Submission
} from '@/lib/submissionStore';
import type { FormEntry, HubDeeplink } from '@/types';
import { DeadlineBanner } from './DeadlineBanner';
import { CheckIcon, ExternalLinkIcon } from './icons';

interface Props {
  form: FormEntry;
  fieldLabels: Record<string, string>;
}

const KIND_STYLES: Record<HubDeeplink['kind'], string> = {
  vergleich: 'border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-900',
  lokal: 'border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-900',
  kommune: 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900',
  formular: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-ink'
};

const KIND_LABELS: Record<HubDeeplink['kind'], string> = {
  vergleich: 'Vergleich',
  lokal: 'Lokal',
  kommune: 'Kommune',
  formular: 'Formular'
};

const PFLICHT_BADGE_STYLES = {
  pflicht: 'bg-rose-100 text-rose-800 ring-rose-200',
  frei: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  automatisch: 'bg-slate-100 text-slate-700 ring-slate-200'
} as const;

const PFLICHT_BADGE_LABELS = {
  pflicht: 'Pflicht',
  frei: 'Freie Wahl',
  automatisch: 'Automatisch'
} as const;

function readActiveBuyerId(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split('; ')
    .find(c => c.startsWith('pac-active-buyer='));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
}

function resolveDeeplinkUrl(link: HubDeeplink, profile: ProfileData | null): string {
  if (!link.urlTemplate || !profile) return link.url;
  const replacements: Record<string, string> = {
    postalCode: profile.newAddress.postalCode,
    city: profile.newAddress.city,
    street: profile.newAddress.street
  };
  const resolved = link.urlTemplate.replace(/\{(\w+)\}/g, (_, k: string) =>
    encodeURIComponent(replacements[k] ?? '')
  );
  if (/\{\w+\}/.test(resolved) || resolved.includes('=&') || resolved.endsWith('=')) {
    return link.url;
  }
  return resolved;
}

export function HubTabTemplate({ form, fieldLabels }: Props) {
  const hub = form.hub;
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [situationFlow, setSituationFlow] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setSubmission(getSubmission(form.id) ?? null);
    setHydrated(true);
  }, [form.id]);

  const deadlineInfo = useMemo(() => {
    if (!hub?.deadline || !profile) return null;
    return computeDeadline(hub.deadline, profile);
  }, [hub?.deadline, profile]);

  const copyRows = useMemo(() => {
    if (!hub?.kopierdaten || !profile) return [];
    return hub.kopierdaten.map(key => ({
      key,
      label: fieldLabels[key] ?? key,
      value: valueFromProfile(profile, key)
    }));
  }, [hub?.kopierdaten, profile, fieldLabels]);

  if (!hub) return null;

  function syncToServer(record: Submission) {
    const buyerId = readActiveBuyerId();
    void pushSubmissionToServer(record, {
      id: buyerId,
      email: profile?.email
    }).then(synced => setSubmission(synced));
  }

  function updateProfileField(key: string, raw: string) {
    if (!profile) return;
    const next = setValueOnProfile(profile, key, raw);
    setProfile(next);
    saveProfile(next);
  }

  async function copyField(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(c => (c === label ? null : c)), 1400);
    } catch {
      // ignore
    }
  }

  function openDeeplink(link: HubDeeplink) {
    const url = resolveDeeplinkUrl(link, profile);
    if (!profile) return;
    const next = recordSubmission({
      formId: form.id,
      channel: 'external_link',
      data: {},
      source: form.officialSource,
      status: 'submitted'
    });
    setSubmission(next);
    syncToServer(next);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function markConfirmed() {
    const next = confirmSubmission(form.id);
    if (next) {
      setSubmission(next);
      syncToServer(next);
    }
  }

  const primaryDeeplink = hub.deeplinks[0];
  const situationChoice = hub.situationsCheck?.options.find(o => o.flow === situationFlow);

  if (!hydrated) {
    return (
      <section className="card mt-8 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 h-16 rounded bg-slate-100" />
      </section>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* 0 · Fristen-Banner (nur bei Ampel ≥ yellow) */}
      {deadlineInfo && <DeadlineBanner deadline={deadlineInfo} />}

      {/* Submission-Status */}
      {submission && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${
            submission.status === 'confirmed'
              ? 'bg-emerald-50 text-emerald-900 ring-emerald-200'
              : submission.status === 'draft'
                ? 'bg-slate-50 text-ink-soft ring-slate-200'
                : 'bg-sky-50 text-sky-900 ring-sky-200'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
            {submission.status === 'confirmed' && <CheckIcon className="h-4 w-4" strokeWidth={3} />}
            {submission.status === 'confirmed'
              ? 'Als erledigt markiert'
              : submission.status === 'draft'
                ? 'Entwurf gespeichert'
                : 'In Bearbeitung'}
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

      {/* 1 · Kurz-Status */}
      <section className="card">
        <div className="flex flex-wrap items-center gap-2">
          {hub.pflichtBadge && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${PFLICHT_BADGE_STYLES[hub.pflichtBadge]}`}
            >
              {PFLICHT_BADGE_LABELS[hub.pflichtBadge]}
            </span>
          )}
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Kurz-Status</h2>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{hub.kurzStatus}</p>
      </section>

      {/* 2 · Situations-Check (optional, nur wenn definiert) */}
      {hub.situationsCheck && (
        <section className="card border-brand-200 bg-brand-50">
          <h2 className="text-sm font-semibold text-ink">{hub.situationsCheck.question}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {hub.situationsCheck.options.map(opt => (
              <button
                key={opt.flow}
                type="button"
                onClick={() => {
                  setSituationFlow(opt.flow);
                  if (opt.profileWrite) {
                    updateProfileField(opt.profileWrite.field, String(opt.profileWrite.value));
                  }
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  situationFlow === opt.flow
                    ? 'bg-brand-600 text-white ring-brand-600'
                    : 'bg-white text-brand-700 ring-brand-200 hover:bg-brand-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {situationChoice && (
            <p className="mt-3 text-xs text-brand-900">
              Gewählt: <strong>{situationChoice.label}</strong>
            </p>
          )}
        </section>
      )}

      {/* 3 · Nächster Schritt (mit primärem Deeplink) */}
      <section className="card border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Nächster Schritt
            </h2>
            <p className="mt-1 text-base text-ink">{hub.naechsterSchritt}</p>
          </div>
          {primaryDeeplink && (
            <button
              type="button"
              onClick={() => openDeeplink(primaryDeeplink)}
              className="btn-primary w-full whitespace-nowrap sm:w-auto"
            >
              {primaryDeeplink.label} →
            </button>
          )}
        </div>
      </section>

      {/* 4 · Alle Deeplinks (Grid) */}
      {hub.deeplinks.length > 1 && (
        <section className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Direktlinks
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {hub.deeplinks.map(link => (
              <button
                key={link.url}
                type="button"
                onClick={() => openDeeplink(link)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm transition ${KIND_STYLES[link.kind]}`}
              >
                <ExternalLinkIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                    {KIND_LABELS[link.kind]}
                  </div>
                  <div className="mt-0.5 font-medium">{link.label}</div>
                  {link.note && <div className="mt-0.5 text-xs opacity-80">{link.note}</div>}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 5 · Daten zum Kopieren */}
      {copyRows.length > 0 && (
        <section className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Daten zum Kopieren
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Aus deinem Profil vorbefüllt. Klick auf &bdquo;Kopieren&ldquo;, dann im Portal einfügen.
          </p>
          <div className="mt-4 space-y-2">
            {copyRows.map(row => (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-ink-muted">
                    {row.label}
                  </div>
                  <div className="truncate text-sm font-medium text-ink">{row.value || '—'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyField(row.label, row.value)}
                  className="ml-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50"
                  disabled={!row.value}
                >
                  {copied === row.label ? 'Kopiert' : 'Kopieren'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6 · Checkliste „das brauchst du dabei" */}
      {hub.checkliste && hub.checkliste.length > 0 && (
        <section className="card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Das brauchst du dabei
          </h2>
          <ul className="mt-3 space-y-1.5">
            {hub.checkliste.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7 · Tipps zum Abschließen */}
      {hub.tipps && hub.tipps.length > 0 && (
        <details className="card group">
          <summary className="cursor-pointer list-none">
            <h2 className="inline text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Tipps zum Abschließen
            </h2>
            <span className="ml-2 text-xs text-ink-muted">({hub.tipps.length})</span>
          </summary>
          <ul className="mt-3 space-y-2">
            {hub.tipps.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Nach-Absenden-Hinweis */}
      {submission && submission.status === 'submitted' && (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-ink-soft ring-1 ring-slate-200">
          <strong>Nach dem Absenden im Portal:</strong> Komm zurück hierher und klick oben
          &bdquo;Als erledigt markieren&ldquo;. So bleibt deine Übersicht in <em>Meine Formulare</em> aktuell.
        </div>
      )}
    </div>
  );
}
