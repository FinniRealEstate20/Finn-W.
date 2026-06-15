import { NextResponse } from 'next/server';

import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PendingRequest {
  id: string;
  user_id: string;
  scheduled_for: string;
}

/**
 * Daily cron: sweep DSGVO delete requests whose grace period has matured.
 *
 * Auth: Vercel Cron sets `Authorization: Bearer $CRON_SECRET`.
 *
 * For each ripe request we call supabase.auth.admin.deleteUser, which
 * cascades through all on-delete-cascade FKs (broker_profiles,
 * buyer_profiles, orgs-owned-by-user, milestones, submissions, audit,
 * invitations created by them).
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'cron_not_configured' }, { status: 500 });
  }
  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();

  const { data: pending } = await service
    .from('data_delete_requests')
    .select('id, user_id, scheduled_for')
    .lte('scheduled_for', nowIso)
    .is('completed_at', null)
    .is('canceled_at', null)
    .limit(50);

  const results: { userId: string; ok: boolean; error?: string }[] = [];
  for (const req of (pending ?? []) as PendingRequest[]) {
    const { error: delErr } = await service.auth.admin.deleteUser(req.user_id);
    if (delErr) {
      results.push({ userId: req.user_id, ok: false, error: delErr.message });
      continue;
    }
    // The data_delete_requests row cascades via auth.users → data_delete_requests
    // FK ON DELETE CASCADE, so explicit mark-completed isn't strictly
    // necessary, but we keep it consistent for the audit trail.
    await service
      .from('data_delete_requests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', req.id);
    results.push({ userId: req.user_id, ok: true });
  }

  return NextResponse.json({ processed: results.length, results });
}
