import { NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/getUser';
import { buildUserExport } from '@/lib/dsgvo/export';
import { rateLimit } from '@/lib/rateLimit';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DSGVO Art. 20: Self-service data download. Returns the full user
 * export as a JSON file. We also record the request in
 * data_export_requests so the user can prove they exercised the right.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(`dsgvo-export:${session.userId}`, 3, 86400);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const service = createSupabaseServiceClient();
  const { data: request } = await service
    .from('data_export_requests')
    .insert({ user_id: session.userId, status: 'completed' })
    .select('id')
    .single<{ id: string }>();

  const blob = await buildUserExport(session.userId, session.email);

  if (request) {
    await service
      .from('data_export_requests')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', request.id);
  }

  const json = JSON.stringify(blob, null, 2);
  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="propaftercare-export-${session.userId.slice(0, 8)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
