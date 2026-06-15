import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/getUser';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const service = createSupabaseServiceClient();
  const { error } = await service
    .from('data_delete_requests')
    .update({ canceled_at: new Date().toISOString() })
    .eq('user_id', session.userId)
    .is('completed_at', null)
    .is('canceled_at', null);
  if (error) {
    return NextResponse.json({ error: 'cancel_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
