import Link from 'next/link';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { DsgvoClient } from './DsgvoClient';
import { getSession } from '@/lib/auth/getUser';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function DsgvoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const supabase = createSupabaseServerClient();
  const { data: pendingDelete } = await supabase
    .from('data_delete_requests')
    .select('id, scheduled_for, requested_at')
    .eq('user_id', session.userId)
    .is('completed_at', null)
    .is('canceled_at', null)
    .maybeSingle<{ id: string; scheduled_for: string; requested_at: string }>();

  const backHref = session.role === 'broker' ? `/${locale}/broker` : `/${locale}/dashboard`;

  return (
    <main className="container-page py-10">
      <Link href={backHref} className="text-sm text-ink-soft hover:text-ink">
        ← Zurück
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-ink">Meine Daten</h1>
      <p className="mt-2 text-ink-soft">
        Du hast jederzeit das Recht, deine Daten herunterzuladen oder dein
        Konto vollständig zu löschen.
      </p>

      <DsgvoClient
        locale={locale}
        pendingDelete={pendingDelete ?? null}
      />

      <p className="mt-12 text-xs text-ink-muted">
        Rechtsgrundlage: Art. 17 und Art. 20 DSGVO. Die Löschung erfolgt
        14 Tage nach Anforderung und ist bis dahin widerrufbar.
      </p>
    </main>
  );
}
