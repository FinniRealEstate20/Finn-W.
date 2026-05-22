'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadStatuses } from '@/lib/milestoneStore';
import { progressFor } from '@/lib/milestones';
import { ProgressBar } from './ProgressBar';
import { StatCard } from './StatCard';
import type { Broker, Buyer, MilestoneStatus } from '@/types';

type OverrideMap = Record<string, Record<string, MilestoneStatus>>;

const STORAGE_KEY = 'pac:milestones:v1';

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
    </>
  );
}
