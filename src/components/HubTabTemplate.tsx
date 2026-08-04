'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  loadProfile,
  saveProfile,
  type ProfileData
} from '@/lib/profileStore';
import { valueFromProfile, setValueOnProfile } from '@/lib/portalMapping';
import { computeDeadline, formatDeadlineDate } from '@/lib/fristen';
import {
  confirmSubmission,
  getSubmission,
  pushSubmissionToServer,
  recordSubmission,
  type Submission
} from '@/lib/submissionStore';
import type { FormEntry, HubDeeplink } from '@/types';
import { cn } from '@/lib/cn';
import { DeadlineBanner } from './DeadlineBanner';
import {
  AtSignIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HashIcon,
  LandmarkIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  UsersIcon,
  ZapIcon
} from './icons';

interface Props {
  form: FormEntry;
  fieldLabels: Record<string, string>;
  headerTitle?: string;
  headerHint?: string;
}

type IconComponent = (props: { className?: string }) => React.ReactElement;

const KIND_META: Record<HubDeeplink['kind'], { label: string; Icon: IconComponent }> = {
  vergleich: { label: 'Vergleich', Icon: ScaleIcon },
  lokal: { label: 'Lokaler Anbieter', Icon: LandmarkIcon },
  kommune: { label: 'Kommune', Icon: LandmarkIcon },
  formular: { label: 'Formular', Icon: FileTextIcon }
};

const PFLICHT_META = {
  pflicht: { label: 'Pflicht', cls: 'bg-ink text-white' },
  frei: { label: 'Freie Wahl', cls: 'bg-white text-ink ring-1 ring-slate-300' },
  automatisch: { label: 'Läuft automatisch', cls: 'bg-slate-100 text-ink-soft ring-1 ring-slate-200' }
} as const;

function iconForCopyKey(key: string): IconComponent {
  if (/(address|street|city|postal)/i.test(key)) return MapPinIcon;
  if (/(iban|payment|karte)/i.test(key)) return CreditCardIcon;
  if (/(date|birth|einzug|moveIn)/i.test(key)) return CalendarIcon;
  if (/(meter|zaehler|reading|kwh|consumption|malo)/i.test(key)) return ZapIcon;
  if (/(email|mail)/i.test(key)) return AtSignIcon;
  if (/(phone|tel)/i.test(key)) return PhoneIcon;
  if (/(household|personen|size)/i.test(key)) return UsersIcon;
  if (/(number|nummer|id|steuer|beitragsnummer)/i.test(key)) return HashIcon;
  return FileTextIcon;
}

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

export function HubTabTemplate({ form, fieldLabels, headerTitle, headerHint }: Props) {
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
      label: fieldLabels[key] ?? humanizeKey(key),
      value: valueFromProfile(profile, key),
      Icon: iconForCopyKey(key)
    }));
  }, [hub?.kopierdaten, profile, fieldLabels]);

  const completeness = useMemo(() => {
    if (copyRows.length === 0) return null;
    const filled = copyRows.filter(r => r.value.trim().length > 0).length;
    return { filled, total: copyRows.length };
  }, [copyRows]);

  if (!hub) return null;

  const [primaryLink, ...secondaryLinks] = hub.deeplinks;

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
    if (!profile) return;
    const url = resolveDeeplinkUrl(link, profile);
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

  const situationChoice = hub.situationsCheck?.options.find(o => o.flow === situationFlow);

  if (!hydrated) {
    return (
      <div className="mt-6 space-y-8 animate-pulse">
        <div className="rounded-3xl bg-white p-10 shadow-card">
          <div className="h-4 w-1/4 rounded bg-slate-200" />
          <div className="mt-6 h-8 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-10">
      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50/50 via-white to-white p-8 shadow-card sm:p-10">
        <div className="flex flex-col gap-6">
          {/* Top row: Pflicht-Badge links, Countdown / Erledigt-Status rechts */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {hub.pflichtBadge && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
                  PFLICHT_META[hub.pflichtBadge].cls
                )}
              >
                {PFLICHT_META[hub.pflichtBadge].label}
              </span>
            )}
            {submission?.status === 'confirmed' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
                <CheckIcon className="h-3 w-3" strokeWidth={3} />
                Als erledigt markiert
              </span>
            ) : deadlineInfo && deadlineInfo.level !== 'green' ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1',
                  deadlineInfo.level === 'expired' || deadlineInfo.level === 'red'
                    ? 'bg-rose-50 text-rose-800 ring-rose-200'
                    : deadlineInfo.level === 'orange'
                      ? 'bg-orange-50 text-orange-800 ring-orange-200'
                      : 'bg-amber-50 text-amber-800 ring-amber-200'
                )}
                title={deadlineInfo.message}
              >
                <ClockIcon className="h-3 w-3" />
                {deadlineInfo.countdown} · {formatDeadlineDate(deadlineInfo.target)}
              </span>
            ) : null}
          </div>

          {/* Titel + Lead */}
          <div className="max-w-2xl">
            {headerTitle && (
              <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {headerTitle}
              </h1>
            )}
            {headerHint && (
              <p className="mt-1 text-sm text-ink-muted">{headerHint}</p>
            )}
            <p className={cn('text-base leading-relaxed text-ink-soft', headerTitle ? 'mt-5' : '')}>
              {hub.kurzStatus}
            </p>
          </div>

          {/* Meta-Chips: Duration / Cost / Processing */}
          {(form.estimatedTimeMin || form.estimatedCost || form.estimatedProcessing) && (
            <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
              {form.estimatedTimeMin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  <ClockIcon className="h-3 w-3" />
                  {form.estimatedTimeMin} Min
                </span>
              )}
              {form.estimatedCost && (
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  {form.estimatedCost}
                </span>
              )}
              {form.estimatedProcessing && (
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  Bearbeitung: {form.estimatedProcessing}
                </span>
              )}
            </div>
          )}

          {/* Nächster Schritt + primärer CTA */}
          {primaryLink && (
            <div className="mt-2 flex flex-col gap-4 border-t border-slate-200/60 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  Dein nächster Schritt
                </div>
                <p className="mt-1 text-base text-ink">{hub.naechsterSchritt}</p>
              </div>
              <button
                type="button"
                onClick={() => openDeeplink(primaryLink)}
                className="btn-primary w-full whitespace-nowrap sm:w-auto"
              >
                {primaryLink.label} →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Fristen-Banner (nur wenn wirklich dringend, ergänzt Hero-Chip) */}
      {deadlineInfo &&
        (deadlineInfo.level === 'red' ||
          deadlineInfo.level === 'orange' ||
          deadlineInfo.level === 'expired') && (
          <DeadlineBanner deadline={deadlineInfo} />
        )}

      {/* Situations-Check */}
      {hub.situationsCheck && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Situations-Check
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
            {hub.situationsCheck.question}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
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
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  situationFlow === opt.flow
                    ? 'bg-ink text-white'
                    : 'bg-slate-100 text-ink-soft hover:bg-slate-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {situationChoice && (
            <p className="mt-4 text-sm text-ink-muted">
              Gewählt: <span className="font-semibold text-ink">{situationChoice.label}</span>
            </p>
          )}
        </section>
      )}

      {/* ═════════════════════ WEITERE DIREKTLINKS ═════════════════════ */}
      {secondaryLinks.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Alternativen</h2>
            <span className="text-xs text-ink-muted">
              {secondaryLinks.length} weitere{' '}
              {secondaryLinks.length === 1 ? 'Option' : 'Optionen'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {secondaryLinks.map(link => {
              const meta = KIND_META[link.kind];
              const Icon = meta.Icon;
              return (
                <button
                  key={link.url}
                  type="button"
                  onClick={() => openDeeplink(link)}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-ink hover:shadow-card"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink-soft transition group-hover:bg-ink group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-ink">
                      {link.label}
                    </span>
                    {link.note && (
                      <span className="mt-1 block text-xs text-ink-muted">{link.note}</span>
                    )}
                  </span>
                  <ExternalLinkIcon className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-ink-muted transition group-hover:text-ink" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ═════════════════════ DATEN ZUM KOPIEREN ═════════════════════ */}
      {copyRows.length > 0 && (
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Deine Daten zum Kopieren
            </h2>
            {completeness && (
              <span
                className={cn(
                  'text-xs font-medium',
                  completeness.filled === completeness.total
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                )}
              >
                {completeness.filled} von {completeness.total} ausgefüllt
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            {copyRows.map((row, i) => {
              const Icon = row.Icon;
              const isEmpty = !row.value.trim();
              return (
                <div
                  key={row.key}
                  className={cn(
                    'group relative flex items-start gap-4 p-4 transition hover:bg-slate-50/60',
                    i > 0 && 'border-t border-slate-100'
                  )}
                >
                  {/* Linker Statusbalken */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-4 bottom-4 w-0.5 rounded-full',
                      isEmpty ? 'bg-amber-400' : 'bg-emerald-400'
                    )}
                  />
                  <span
                    className={cn(
                      'ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                      isEmpty
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-ink-soft'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      {row.label}
                    </div>
                    <div
                      className={cn(
                        'mt-1 truncate text-sm font-medium',
                        isEmpty ? 'text-amber-800' : 'text-ink'
                      )}
                    >
                      {isEmpty ? 'Noch nicht ausgefüllt' : row.value}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      isEmpty ? undefined : copyField(row.label, row.value)
                    }
                    disabled={isEmpty}
                    className={cn(
                      'flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                      isEmpty
                        ? 'cursor-not-allowed text-ink-muted'
                        : copied === row.label
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-white text-ink ring-1 ring-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {isEmpty ? 'Ergänzen' : copied === row.label ? 'Kopiert' : 'Kopieren'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═════════════════════ CHECKLISTE ═════════════════════ */}
      {hub.checkliste && hub.checkliste.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">
            Das brauchst du dabei
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <ul className="space-y-3">
              {hub.checkliste.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-soft">
                  <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-slate-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ═════════════════════ TIPPS ═════════════════════ */}
      {hub.tipps && hub.tipps.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">
            Worauf du achten solltest
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {hub.tipps.map((tip, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-ink-soft shadow-card"
              >
                {tip}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═════════════════════ ERLEDIGT-CTA ═════════════════════ */}
      {submission && submission.status !== 'confirmed' && (
        <section className="rounded-2xl bg-slate-50 p-5 text-center ring-1 ring-slate-200">
          <p className="text-sm text-ink-soft">
            Fertig im Portal?{' '}
            <button
              type="button"
              onClick={markConfirmed}
              className="ml-1 rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black"
            >
              Als erledigt markieren
            </button>
          </p>
          {submission.receiptId && (
            <p className="mt-2 text-[11px] text-ink-muted">
              Beleg-ID <span className="font-mono">{submission.receiptId}</span>
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function humanizeKey(key: string): string {
  // 'meters.electricity.meterNumber' → 'Zählernummer Strom' etc.
  const parts = key.split('.');
  const last = parts[parts.length - 1];
  return last
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
}
