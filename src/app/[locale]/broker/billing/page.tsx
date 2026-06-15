import Link from 'next/link';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { BillingClient } from './BillingClient';
import { getSession } from '@/lib/auth/getUser';
import { getOrgBilling } from '@/lib/billing/org';
import { PLANS } from '@/lib/billing/plans';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  trialing: 'Test-Phase',
  active: 'Aktiv',
  past_due: 'Zahlung offen',
  canceled: 'Gekündigt',
  inactive: 'Inaktiv',
};

export default async function BrokerBillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { locale } = await params;
  const { success, canceled } = await searchParams;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session || session.role !== 'broker' || !session.orgId) {
    redirect(`/${locale}/login`);
  }

  const org = await getOrgBilling(session.orgId);
  const currentTier = org?.planTier;
  const trialEnds = org?.trialEndsAt ? new Date(org.trialEndsAt) : null;
  const trialDaysLeft = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <main className="container-page py-10">
      <Link
        href={`/${locale}/broker`}
        className="text-sm text-ink-soft hover:text-ink"
      >
        ← Zurück zum Dashboard
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-ink">Abonnement</h1>

      {success && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Abo aktiviert. Vielen Dank!
        </div>
      )}
      {canceled && (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Bezahlung abgebrochen. Du kannst es jederzeit erneut versuchen.
        </div>
      )}

      <section className="card mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink">Aktueller Plan</h2>
          <span className="text-xs text-ink-muted">
            {org?.planStatus
              ? STATUS_LABEL[org.planStatus] ?? org.planStatus
              : 'Unbekannt'}
          </span>
        </div>
        <p className="mt-1 text-2xl font-bold text-brand-700">
          {currentTier
            ? PLANS[currentTier].id.replace(/^./, c => c.toUpperCase())
            : 'Noch nicht gewählt'}
        </p>
        {currentTier && (
          <p className="mt-1 text-sm text-ink-soft">
            {PLANS[currentTier].monthlyPriceEur} € / Monat
          </p>
        )}
        {trialDaysLeft != null && org?.planStatus === 'trialing' && (
          <p className="mt-2 text-sm text-amber-700">
            Noch {trialDaysLeft} {trialDaysLeft === 1 ? 'Tag' : 'Tage'} Testphase.
          </p>
        )}
      </section>

      <BillingClient
        locale={locale}
        currentTier={currentTier ?? null}
        hasCustomer={!!org?.stripeCustomerId}
      />
    </main>
  );
}
