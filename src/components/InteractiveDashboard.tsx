'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProgressBar } from './ProgressBar';
import { PhaseSection } from './PhaseSection';
import { loadStatuses, resetBuyer, saveStatus } from '@/lib/milestoneStore';
import { milestonesByPhase, progressFor } from '@/lib/milestones';
import type { Buyer, Milestone, MilestoneStatus, Phase } from '@/types';
import { ClockIcon, InfoIcon } from './icons';

const PHASES: Phase[] = [1, 2, 3, 4];

export function InteractiveDashboard({ buyer, locale }: { buyer: Buyer; locale: string }) {
  const t = useTranslations('dashboard');
  const [milestones, setMilestones] = useState<Milestone[]>(buyer.milestones);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStatuses(buyer.id);
    if (Object.keys(stored).length > 0) {
      setMilestones(prev =>
        prev.map(m => (stored[m.id] ? { ...m, status: stored[m.id] } : m))
      );
    }
    setHydrated(true);
  }, [buyer.id]);

  function toggle(id: string) {
    setMilestones(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const nextStatus: MilestoneStatus = m.status === 'done' ? 'open' : 'done';
        saveStatus(buyer.id, m.id, nextStatus);
        return { ...m, status: nextStatus };
      })
    );
  }

  function reset() {
    resetBuyer(buyer.id);
    setMilestones(buyer.milestones);
  }

  const grouped = useMemo(() => milestonesByPhase(milestones), [milestones]);
  const { done, total, percent } = progressFor(milestones);
  const criticalOpen = milestones.find(m => m.status !== 'done' && m.isCriticalDeadline);

  return (
    <>
      {/* Greeting + Progress */}
      <section className="card mb-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-ink">
              {t('greeting', { name: buyer.name })}
            </h1>
            <p className="mt-1 text-ink-soft">{t('todayLine')}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {t('progress')}
            </div>
            <div className="text-2xl font-bold text-brand-600">{percent}%</div>
            <div className="text-xs text-ink-muted">
              {t('tasksDone', { done, total })}
            </div>
          </div>
        </div>
        <ProgressBar percent={percent} className="mt-5" />
      </section>

      {/* Critical-Deadline Banner */}
      {criticalOpen && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <ClockIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-900">
              {t('criticalBanner', { days: criticalOpen.dueInDays ?? 14 })}
            </div>
            <div className="mt-0.5 text-xs text-red-800">
              Aufgabe: <strong>{criticalOpen.id}</strong> – wir erinnern dich bis es erledigt ist.
            </div>
          </div>
        </div>
      )}

      {/* Hinweis-Karte und Reset-Button */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-ink-muted">
        <span className="inline-flex items-start gap-2">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
          <span><strong>Demo-Modus:</strong> Klicke auf die Meilensteine, um sie als erledigt zu markieren. Dein Stand wird im Browser gespeichert.</span>
        </span>
        <button
          type="button"
          onClick={reset}
          className="ml-4 flex-shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1 font-medium text-ink-soft hover:bg-slate-50"
        >
          Demo zurücksetzen
        </button>
      </div>

      {/* Phases */}
      <div className="space-y-10" suppressHydrationWarning>
        {PHASES.map(p =>
          grouped[p].length > 0 ? (
            <PhaseSection
              key={p}
              phase={p}
              milestones={grouped[p]}
              onToggle={toggle}
              locale={locale}
              propertyType={buyer.propertyType}
            />
          ) : null
        )}
      </div>

      {!hydrated && (
        <div aria-hidden className="sr-only">
          Lade gespeicherten Stand…
        </div>
      )}
    </>
  );
}
