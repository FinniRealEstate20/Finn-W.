'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadStatuses } from '@/lib/milestoneStore';
import { progressFor } from '@/lib/milestones';
import { ProgressBar } from './ProgressBar';
import { StatCard } from './StatCard';
import type { Broker, Buyer, MilestoneStatus } from '@/types';

type OverrideMap = Record<string, Record<string, MilestoneStatus>>;

interface SubmissionFeedItem {
  formId: string;
  channel: string;
  status: string;
  serverReceiptId: string;
  submittedAt: string;
}

const STORAGE_KEY = 'pac:milestones:v1';
const POLL_INTERVAL_MS = 4000;

const FORM_LABEL: Record<string, string> = {
  'wohnsitz-paderborn': 'Wohnsitz-Anmeldung',
  'kfz-paderborn': 'KFZ ummelden',
  grundsteuer: 'Grundsteuer',
  'strom-westfalenweser': 'Strom Westfalen Weser',
  'strom-stadtwerke-pb': 'Strom Stadtwerke',
  gas: 'Gas',
  wasser: 'Wasser',
  'asp-abfall': 'ASP Abfall',
  internet: 'Internet',
  wohngebaeude: 'Wohngebäudeversicherung',
  hausrat: 'Hausrat',
  gez: 'Rundfunkbeitrag',
  post: 'Nachsendeauftrag',
  bank: 'Daueraufträge',
  verwaltung: 'Hausverwaltung',
  mietvertrag: 'Mietvertrag',
  vermieterhaftpflicht: 'Vermieter-Haftpflicht'
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Entwurf', cls: 'bg-slate-100 text-ink-soft' },
  submitted: { label: 'Eingereicht', cls: 'bg-sky-50 text-sky-700' },
  confirmed: { label: 'Erledigt', cls: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Fehler', cls: 'bg-red-50 text-red-700' }
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `vor ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `vor ${min} Min`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std`;
  return new Date(iso).toLocaleDateString('de-DE');
}

export function InteractiveBrokerList({
  buyers,
  broker
}: {
  buyers: readonly Buyer[];
  broker: Broker;
}) {
  const t = useTranslations('broker');
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [pulse, setPulse] = useState(false);
  const [feed, setFeed] = useState<SubmissionFeedItem[]>([]);

  useEffect(() => {
    function loadAll() {
      const merged: OverrideMap = {};
      for (const b of buyers) {
        merged[b.id] = loadStatuses(b.id);
      }
      setOverrides(merged);
    }
    loadAll();

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        loadAll();
        setPulse(true);
        window.setTimeout(() => setPulse(false), 1200);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [buyers]);

  useEffect(() => {
    let cancelled = false;
    async function pollSubmissions() {
      try {
        const res = await fetch('/api/submissions?limit=12', { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as { items: SubmissionFeedItem[] };
        if (cancelled) return;
        setFeed(prev => {
          const knownIds = new Set(prev.map(i => i.serverReceiptId));
          const hasNew = json.items.some(i => !knownIds.has(i.serverReceiptId));
          if (hasNew && prev.length > 0) {
            setPulse(true);
            window.setTimeout(() => setPulse(false), 1500);
          }
          return json.items;
        });
      } catch {
        // ignore
      }
    }
    void pollSubmissions();
    const id = window.setInterval(pollSubmissions, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const liveBuyers = buyers.map(b => {
    const o = overrides[b.id] ?? {};
    if (Object.keys(o).length === 0) return b;
    return {
      ...b,
      milestones: b.milestones.map(m => (o[m.id] ? { ...m, status: o[m.id] } : m))
    };
  });

  const totalMilestones = liveBuyers.reduce((s, b) => s + b.milestones.length, 0);
  const doneMilestones = liveBuyers.reduce(
    (s, b) => s + b.milestones.filter(m => m.status === 'done').length,
    0
  );

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('dashboard.metrics.active')} value={`${liveBuyers.length}`} />
        <StatCard
          label={t('dashboard.metrics.milestonesDone')}
          value={`${doneMilestones}/${totalMilestones}`}
        />
        <StatCard
          label={t('dashboard.metrics.reviewsGenerated')}
          value={`${broker.reviews.total}`}
          accent="emerald"
        />
        <StatCard
          label={t('dashboard.metrics.averageRating')}
          value={`${broker.reviews.average} ★`}
          accent="amber"
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {t('dashboard.customersTitle')}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              pulse
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-ink-muted'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                pulse ? 'animate-ping bg-emerald-500' : 'bg-emerald-400'
              }`}
            />
            {pulse ? 'Aktualisiert' : 'Live'}
          </span>
        </div>
        <div className="space-y-3">
          {liveBuyers.map(buyer => {
            const { percent, done, total } = progressFor(buyer.milestones);
            const currentPhase =
              buyer.milestones.find(m => m.status === 'in_progress')?.phase ??
              buyer.milestones.find(m => m.status !== 'done')?.phase ??
              4;
            return (
              <article key={buyer.id} className="card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-ink">{buyer.name}</h3>
                      <span className="chip">
                        {t(`dashboard.profileLabel.${buyer.propertyType}`)}
                      </span>
                      <span className="text-xs text-ink-muted">
                        {t('dashboard.phase', { n: currentPhase })}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-ink-muted">{buyer.address}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium text-ink">
                      {done}/{total} erledigt · {percent}%
                    </span>
                    <ProgressBar percent={percent} className="w-48" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Live-Aktivität</h2>
            <p className="text-xs text-ink-muted">
              Eingereichte Formulare deiner Käufer (Server-Beleg, alle 4 Sek. aktualisiert)
            </p>
          </div>
          <span className="text-xs text-ink-muted">{feed.length} Einträge</span>
        </div>
        {feed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-ink-muted">
            Noch keine Einreichungen. Sobald ein Käufer ein Formular abschickt, erscheint es hier.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {feed.map(item => {
              const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.submitted;
              return (
                <li
                  key={item.serverReceiptId}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-ink">
                      {FORM_LABEL[item.formId] ?? item.formId}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Beleg <span className="font-mono">{item.serverReceiptId}</span> ·{' '}
                      {relativeTime(item.submittedAt)}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
