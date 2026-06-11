'use client';

import { useEffect, useState, useTransition } from 'react';
import type { RecipeProposal } from '@/lib/recipeProposals/server';

interface Props {
  initial: RecipeProposal[];
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `vor ${sec} s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `vor ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `vor ${hr} h`;
  const days = Math.round(hr / 24);
  return `vor ${days} Tagen`;
}

export function RecipeProposalsCard({ initial }: Props) {
  const [proposals, setProposals] = useState<RecipeProposal[]>(initial);
  const [filter, setFilter] = useState<'new' | 'all'>('new');
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/portal-mapper', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { proposals: RecipeProposal[] };
        setProposals(data.proposals);
      } catch {
        // ignore
      }
    }, 12_000);
    return () => clearInterval(interval);
  }, []);

  function decide(id: string, status: 'accepted' | 'dismissed') {
    setBusyId(id);
    startTransition(async () => {
      try {
        const res = await fetch('/api/portal-mapper', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status })
        });
        if (res.ok) {
          setProposals(prev =>
            prev.map(p => (p.id === id ? { ...p, status, decidedAt: new Date().toISOString() } : p))
          );
        }
      } finally {
        setBusyId(null);
      }
    });
  }

  const visible = filter === 'new' ? proposals.filter(p => p.status === 'new') : proposals;
  const newCount = proposals.filter(p => p.status === 'new').length;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">KI-Vorschläge zur Recipe-Pflege</h2>
          <p className="text-sm text-ink-soft">
            Wenn ein Behörden-Portal sein HTML ändert, schlägt unser KI-Mapper neue Selektoren vor.
            Hier prüfst du die Vorschläge.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter('new')}
            className={`rounded-full px-3 py-1.5 font-medium ring-1 ${
              filter === 'new'
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-ink-soft ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Neu ({newCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1.5 font-medium ring-1 ${
              filter === 'all'
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-ink-soft ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Alle ({proposals.length})
          </button>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="card text-center text-sm text-ink-muted">
          {filter === 'new'
            ? 'Aktuell keine offenen Vorschläge. Sobald ein Käufer ein Portal nutzt, dessen HTML sich geändert hat, taucht hier ein Vorschlag auf.'
            : 'Noch keine Vorschläge.'}
        </div>
      )}

      {visible.length > 0 && (
        <div className="card space-y-3 p-0">
          {visible.map(p => (
            <div key={p.id} className="border-b border-slate-100 p-4 last:border-b-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="font-mono rounded bg-slate-100 px-2 py-0.5">{p.docId}</span>
                    <span>·</span>
                    <span>{p.label}</span>
                    <span>·</span>
                    <span>{timeAgo(p.proposedAt)}</span>
                  </div>
                  <div className="mt-2 font-mono text-sm text-ink">
                    {p.selector}
                  </div>
                  {p.attemptedSelectors.length > 0 && (
                    <div className="mt-1 text-xs text-ink-muted">
                      Vorher erfolglos:{' '}
                      <span className="font-mono">{p.attemptedSelectors.slice(0, 2).join(' · ')}</span>
                      {p.attemptedSelectors.length > 2 && ` (+${p.attemptedSelectors.length - 2})`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.status === 'new' ? (
                    <>
                      <button
                        type="button"
                        disabled={pending && busyId === p.id}
                        onClick={() => decide(p.id, 'accepted')}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Übernehmen
                      </button>
                      <button
                        type="button"
                        disabled={pending && busyId === p.id}
                        onClick={() => decide(p.id, 'dismissed')}
                        className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Verwerfen
                      </button>
                    </>
                  ) : (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-slate-100 text-ink-muted ring-1 ring-slate-200'
                      }`}
                    >
                      {p.status === 'accepted' ? '✓ Übernommen' : 'Verworfen'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-muted">
        Übernommene Vorschläge fließen beim nächsten Release ins Recipe-Repo. Für jede angenommene
        Aktualisierung erhältst du <strong>1 Mitkurations-Punkt</strong> (3/6/9-System oben).
      </p>
    </section>
  );
}
