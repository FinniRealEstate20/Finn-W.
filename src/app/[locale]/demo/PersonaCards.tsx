'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Persona {
  id: string;
  name: string;
  tagline: string;
  propertyType: string;
  city: string;
  progressPercent: number;
}

const PROPERTY_LABEL: Record<string, string> = {
  ownUse: 'Eigennutzung',
  'investment-self': 'Kapitalanlage – Selbstverwaltung',
  'investment-managed': 'Kapitalanlage – Hausverwaltung',
};

export function PersonaCards({
  personas,
  locale,
}: {
  personas: Persona[];
  locale: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function pick(id: string) {
    if (pendingId) return;
    setPendingId(id);
    try {
      const res = await fetch('/api/active-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        setPendingId(null);
        return;
      }
      router.push(`/${locale}/dashboard?from=demo-persona`);
    } catch {
      setPendingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {personas.map(p => {
        const isPending = pendingId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p.id)}
            disabled={!!pendingId}
            className="card group flex flex-col gap-2 text-left transition hover:border-brand-300 hover:shadow-lg disabled:cursor-wait disabled:opacity-60"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-ink">{p.name}</div>
              <span className="text-[10px] font-medium uppercase tracking-wide text-brand-700">
                {isPending ? '…' : `${p.progressPercent}%`}
              </span>
            </div>
            <div className="text-xs text-ink-soft">{p.tagline}</div>
            <div className="mt-1 text-[11px] text-ink-muted">
              {PROPERTY_LABEL[p.propertyType] ?? p.propertyType} · {p.city}
            </div>
            <span className="mt-2 text-xs font-medium text-brand-700">
              {isPending ? 'Lade Demo…' : 'In diese Demo springen →'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
