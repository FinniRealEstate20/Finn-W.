'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import type { PropertyType } from '@/types';

interface ExistingDemo {
  name: string;
  email: string;
  propertyType: PropertyType;
  city: string;
  moveInDate: string;
}

interface Labels {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  optional: string;
  propertyTypeLabel: string;
  propOwnUse: string;
  propInvestmentSelf: string;
  propInvestmentManaged: string;
  cityLabel: string;
  cityPlaceholder: string;
  moveInLabel: string;
  startCta: string;
  restartCta: string;
  privacyNote: string;
  clearCta: string;
  errorGeneric: string;
}

export function LiveDemoForm({
  locale,
  existing,
  labels,
}: {
  locale: string;
  existing: ExistingDemo | null;
  labels: Labels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<'submit' | 'clear' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy('submit');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim() || undefined,
      propertyType: String(data.get('propertyType') ?? '') as PropertyType,
      city: String(data.get('city') ?? '').trim(),
      moveInDate: String(data.get('moveInDate') ?? '').trim(),
    };

    try {
      const res = await fetch('/api/demo-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(labels.errorGeneric);
        setBusy(null);
        return;
      }
      router.push(`/${locale}/dashboard?from=demo`);
      router.refresh();
    } catch {
      setError(labels.errorGeneric);
      setBusy(null);
    }
  }

  async function onClear() {
    if (busy) return;
    setBusy('clear');
    try {
      await fetch('/api/demo-buyer', { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {error && (
        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">{labels.nameLabel}</span>
            <input
              type="text"
              name="name"
              required
              maxLength={80}
              defaultValue={existing?.name ?? ''}
              className="input mt-1 w-full"
              placeholder={labels.namePlaceholder}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">
              {labels.emailLabel}{' '}
              <span className="text-ink-muted">({labels.optional})</span>
            </span>
            <input
              type="email"
              name="email"
              maxLength={120}
              defaultValue={existing?.email ?? ''}
              className="input mt-1 w-full"
              placeholder={labels.emailPlaceholder}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink">{labels.propertyTypeLabel}</span>
          <select
            name="propertyType"
            required
            defaultValue={existing?.propertyType ?? 'ownUse'}
            className="input mt-1 w-full"
          >
            <option value="ownUse">{labels.propOwnUse}</option>
            <option value="investment-self">{labels.propInvestmentSelf}</option>
            <option value="investment-managed">{labels.propInvestmentManaged}</option>
          </select>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">{labels.cityLabel}</span>
            <input
              type="text"
              name="city"
              required
              maxLength={80}
              defaultValue={existing?.city ?? 'Paderborn'}
              className="input mt-1 w-full"
              placeholder={labels.cityPlaceholder}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">{labels.moveInLabel}</span>
            <input
              type="date"
              name="moveInDate"
              required
              defaultValue={existing?.moveInDate ?? ''}
              className="input mt-1 w-full"
            />
          </label>
        </div>

        <button type="submit" disabled={!!busy} className="btn-primary mt-2 w-full disabled:opacity-60">
          {busy === 'submit'
            ? '…'
            : existing
              ? labels.restartCta
              : labels.startCta}
        </button>

        <p className="text-center text-xs text-ink-muted">{labels.privacyNote}</p>
      </form>

      {existing && (
        <button
          type="button"
          onClick={onClear}
          disabled={!!busy}
          className="mt-3 w-full text-center text-xs text-ink-muted hover:text-ink disabled:opacity-60"
        >
          {labels.clearCta}
        </button>
      )}
    </>
  );
}
