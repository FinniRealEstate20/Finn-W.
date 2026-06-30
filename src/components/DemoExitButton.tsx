'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DemoExitButton({ locale, label }: { locale: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function exit() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/api/demo-buyer', { method: 'DELETE' });
      router.push(`/${locale}/demo`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exit}
      disabled={busy}
      className="font-medium text-amber-900 hover:underline disabled:opacity-60"
    >
      {label}
    </button>
  );
}
