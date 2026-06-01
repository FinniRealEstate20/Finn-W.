'use client';

import { useState } from 'react';

interface BuyerOption {
  id: string;
  name: string;
  propertyType: string;
}

const PROPERTY_LABEL: Record<string, string> = {
  ownUse: 'Eigennutzer',
  'investment-self': 'Kapitalanlage',
  'investment-managed': 'Kap. verwaltet'
};

export function BuyerSwitcher({
  buyers,
  activeId
}: {
  buyers: BuyerOption[];
  activeId: string;
}) {
  const [busy, setBusy] = useState(false);

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
                ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-200'
                : 'text-ink-soft hover:text-ink'
            }`}
            title={PROPERTY_LABEL[b.propertyType] ?? b.propertyType}
          >
            {b.name}
          </button>
        );
      })}
    </div>
  );
}
