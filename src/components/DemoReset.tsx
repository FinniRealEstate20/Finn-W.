'use client';

import { useState } from 'react';
import { RotateIcon } from './icons';

function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function clearAllPacKeys() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('pac:')) keys.push(key);
    }
    for (const k of keys) window.localStorage.removeItem(k);
  } catch {
    // ignore
  }
}

export function DemoReset() {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function reset() {
    setBusy(true);
    try {
      clearAllPacKeys();
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
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-medium text-ink-soft shadow-lg ring-1 ring-slate-200 hover:bg-slate-50"
          title="Demo zurücksetzen"
        >
          <RotateIcon className="h-3.5 w-3.5" />
          Demo-Reset
        </button>
      )}
    </div>
  );
}
