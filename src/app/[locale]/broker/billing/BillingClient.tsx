'use client';

import { useState, useTransition } from 'react';

import { PLANS, type PlanTier } from '@/lib/billing/plans';

const ORDER: PlanTier[] = ['starter', 'pro', 'business'];

export function BillingClient({
  locale,
  currentTier,
  hasCustomer,
}: {
  locale: string;
  currentTier: PlanTier | null;
  hasCustomer: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function checkout(tier: PlanTier) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, locale }),
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (json.url) {
          window.location.href = json.url;
        } else {
          setError(json.error ?? 'Konnte Checkout nicht starten.');
        }
      } catch {
        setError('Netzwerkfehler.');
      }
    });
  }

  function openPortal() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/stripe/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale }),
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (json.url) {
          window.location.href = json.url;
        } else {
          setError(json.error ?? 'Portal nicht verfügbar.');
        }
      } catch {
        setError('Netzwerkfehler.');
      }
    });
  }

  return (
    <>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {ORDER.map(tier => {
          const plan = PLANS[tier];
          const isCurrent = currentTier === tier;
          return (
            <div
              key={tier}
              className={`card ${
                isCurrent ? 'border-brand-600 ring-2 ring-brand-200' : ''
              }`}
            >
              <h3 className="text-lg font-semibold capitalize text-ink">{plan.id}</h3>
              <p className="mt-1 text-2xl font-bold text-ink">
                {plan.monthlyPriceEur} €
                <span className="text-sm font-normal text-ink-muted"> / Monat</span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                <li>
                  {plan.maxActiveBuyers
                    ? `Bis zu ${plan.maxActiveBuyers} aktive Käufer`
                    : 'Unbegrenzte aktive Käufer'}
                </li>
                <li>{plan.whiteLabel ? 'White-Label-Branding' : 'PropAfterCare-Branding'}</li>
                <li>{plan.prioritySupport ? 'Priority-Support' : 'E-Mail-Support'}</li>
              </ul>
              <button
                type="button"
                onClick={() => checkout(tier)}
                disabled={pending || isCurrent}
                className={`mt-6 w-full ${
                  isCurrent ? 'btn-secondary' : 'btn-primary'
                } disabled:opacity-50`}
              >
                {isCurrent ? 'Aktiver Plan' : pending ? 'Lade …' : `${plan.id} wählen`}
              </button>
            </div>
          );
        })}
      </section>

      {hasCustomer && (
        <section className="card mt-6">
          <h2 className="text-lg font-semibold text-ink">Abo verwalten</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Zahlungsmethode ändern, Rechnungen herunterladen oder Abo kündigen.
          </p>
          <button
            type="button"
            onClick={openPortal}
            disabled={pending}
            className="btn-secondary mt-4"
          >
            {pending ? 'Lade …' : 'Stripe-Portal öffnen'}
          </button>
        </section>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {error}
        </div>
      )}
    </>
  );
}
