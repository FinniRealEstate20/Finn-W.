'use client';

import { useState, useTransition } from 'react';

export function DsgvoClient({
  locale,
  pendingDelete,
}: {
  locale: string;
  pendingDelete: { id: string; scheduled_for: string; requested_at: string } | null;
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );
  const [deletePending, setDeletePending] = useState<typeof pendingDelete>(pendingDelete);

  async function exportData() {
    setFeedback(null);
    const res = await fetch('/api/dsgvo/export', { method: 'POST' });
    if (!res.ok) {
      setFeedback({ ok: false, message: 'Download fehlgeschlagen.' });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `propaftercare-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ ok: true, message: 'Download gestartet.' });
  }

  function requestDelete() {
    if (
      !confirm(
        'Konto wirklich zur Löschung anmelden? Du hast 14 Tage Zeit, das zu widerrufen.'
      )
    )
      return;
    setFeedback(null);
    startTransition(async () => {
      const res = await fetch('/api/dsgvo/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        scheduledFor?: string;
        error?: string;
      };
      if (json.ok && json.scheduledFor) {
        setDeletePending({
          id: 'new',
          scheduled_for: json.scheduledFor,
          requested_at: new Date().toISOString(),
        });
        setFeedback({
          ok: true,
          message: `Löschung geplant für ${new Date(json.scheduledFor).toLocaleDateString(locale)}.`,
        });
      } else {
        setFeedback({ ok: false, message: json.error ?? 'Fehler.' });
      }
    });
  }

  function cancelDelete() {
    setFeedback(null);
    startTransition(async () => {
      const res = await fetch('/api/dsgvo/delete/cancel', { method: 'POST' });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setDeletePending(null);
        setFeedback({ ok: true, message: 'Löschung widerrufen.' });
      } else {
        setFeedback({ ok: false, message: json.error ?? 'Fehler.' });
      }
    });
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="card">
        <h2 className="text-lg font-semibold text-ink">Daten herunterladen</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Alle gespeicherten Daten als JSON-Datei, sofort herunterladbar.
        </p>
        <button
          type="button"
          onClick={() => void exportData()}
          disabled={pending}
          className="btn-secondary mt-4"
        >
          {pending ? 'Lade …' : 'JSON herunterladen'}
        </button>
      </section>

      <section className="card border-rose-200">
        <h2 className="text-lg font-semibold text-rose-700">Konto löschen</h2>
        <p className="mt-1 text-sm text-ink-soft">
          14 Tage Bedenkzeit. In dieser Zeit kannst du die Löschung jederzeit
          widerrufen. Danach werden alle Daten unwiderruflich entfernt.
        </p>
        {deletePending ? (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Geplant für{' '}
            {new Date(deletePending.scheduled_for).toLocaleDateString(locale)}.
            <button
              type="button"
              onClick={cancelDelete}
              disabled={pending}
              className="ml-3 font-semibold underline"
            >
              Widerrufen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={requestDelete}
            disabled={pending}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {pending ? '…' : 'Löschung anfordern'}
          </button>
        )}
      </section>

      {feedback && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            feedback.ok
              ? 'bg-emerald-50 text-emerald-900'
              : 'bg-rose-50 text-rose-900'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
