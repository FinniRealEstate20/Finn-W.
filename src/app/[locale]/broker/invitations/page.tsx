import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CreateInvitationCard } from './CreateInvitationCard';
import { InvitationRow } from './InvitationRow';
import { getSession } from '@/lib/auth/getUser';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface Invitation {
  id: string;
  code: string;
  label: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

export default async function BrokerInvitationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session || session.role !== 'broker') {
    redirect(`/${locale}/login`);
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('invitations')
    .select('id, code, label, max_uses, used_count, expires_at, created_at')
    .eq('org_id', session.orgId!)
    .order('created_at', { ascending: false });
  const invitations = (data ?? []) as Invitation[];

  const t = await getTranslations('broker.invitations');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  return (
    <main className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/${locale}/broker`}
            className="text-sm text-ink-soft hover:text-ink"
          >
            ← {t('backToDashboard')}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-soft">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CreateInvitationCard locale={locale} appUrl={appUrl} />
        </div>
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-ink">{t('listTitle')}</h2>
            {invitations.length === 0 ? (
              <p className="mt-4 text-sm text-ink-muted">{t('empty')}</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {invitations.map(inv => (
                  <InvitationRow
                    key={inv.id}
                    invitation={inv}
                    locale={locale}
                    appUrl={appUrl}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
