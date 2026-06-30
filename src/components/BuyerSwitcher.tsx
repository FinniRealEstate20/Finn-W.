'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BuyerOption {
  id: string;
  name: string;
  propertyType: string;
  isLive: boolean;
}

const PROPERTY_LABEL: Record<string, string> = {
  ownUse: 'Eigennutzer',
  'investment-self': 'Kapitalanlage',
  'investment-managed': 'Kap. verwaltet'
};

export function BuyerSwitcher({
  buyers,
  activeId,
  locale
}: {
  buyers: BuyerOption[];
  activeId: string;
  locale: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function change(id: string) {
    if (id === activeId || busy) return;
    setBusy(true);
    try {
      await fetch('/api/active-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      window.location.reload();
    } catch {
      setBusy(false);
    }
  }

  function startLiveDemo() {
    router.push(`/${locale}/demo`);
  }

  return (
    <div className="hidden items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-200 sm:flex">
      <span className="px-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
        Demo
      </span>
      {buyers.map(b => {
        const active = b.id === activeId;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => change(b.id)}
            disabled={busy}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              active
                ? b.isLive
                  ? 'bg-amber-50 text-amber-800 shadow-sm ring-1 ring-amber-300'
                  : 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-200'
                : b.isLive
                  ? 'text-amber-800 hover:text-amber-900'
                  : 'text-ink-soft hover:text-ink'
            }`}
            title={PROPERTY_LABEL[b.propertyType] ?? b.propertyType}
          >
            {b.name}
          </button>
        );
      })}
      {!buyers.some(b => b.isLive) && (
        <button
          type="button"
          onClick={startLiveDemo}
          disabled={busy}
          className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-ink-muted transition hover:border-brand-300 hover:text-brand-700"
          title="Live-Demo mit eigenen Daten"
        >
          + Eigene
        </button>
      )}
    </div>
  );
}
