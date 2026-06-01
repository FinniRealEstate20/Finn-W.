'use client';

import { useState } from 'react';

const LOCAL_KEYS = [
  'pac:profile:v1',
  'pac:submissions:v1',
  'pac:milestones:v1',
  'pac:activeBuyer:v1'
];

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function DemoReset() {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function reset() {
    setBusy(true);
    try {
      for (const k of LOCAL_KEYS) {
        try {
          window.localStorage.removeItem(k);
        } catch {
          // ignore
        }
      }
      clearCookie('pac-active-buyer');
      await fetch('/api/submissions', { method: 'DELETE' }).catch(() => null);
    } finally {
      window.location.reload();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {open ? (
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-lg ring-1 ring-slate-200">
          <span className="text-xs font-medium text-ink-soft">Alles zurücksetzen?</span>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? '…' : 'Ja, reset'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-soft hover:bg-slate-200"
          >
            Abbrechen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-white px-3 py-2 text-xs font-medium text-ink-soft shadow-lg ring-1 ring-slate-200 hover:bg-slate-50"
          title="Demo zurücksetzen"
        >
          🔄 Demo-Reset
        </button>
      )}
    </div>
  );
}
