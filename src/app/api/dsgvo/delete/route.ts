import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/getUser';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  reason?: string;
}

/**
 * DSGVO Art. 17: Schedule the user for deletion in 14 days. The 14-day
 * grace period lets them cancel if they change their mind. Cron sweeps
 * matured requests in /api/cron/data-delete.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Body | null;
  const reason =
    typeof body?.reason === 'string' ? body.reason.slice(0, 500) : null;

  const service = createSupabaseServiceClient();
  // Reject if there's already an active request.
  const { data: existing } = await service
    .from('data_delete_requests')
    .select('id, scheduled_for')
    .eq('user_id', session.userId)
    .is('completed_at', null)
    .is('canceled_at', null)
    .maybeSingle<{ id: string; scheduled_for: string }>();
  if (existing) {
    return NextResponse.json({
      ok: true,
      scheduledFor: existing.scheduled_for,
      alreadyScheduled: true,
    });
  }

  const { data: created, error } = await service
    .from('data_delete_requests')
    .insert({ user_id: session.userId, reason })
    .select('id, scheduled_for')
    .single<{ id: string; scheduled_for: string }>();
  if (error || !created) {
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, scheduledFor: created.scheduled_for });
}
