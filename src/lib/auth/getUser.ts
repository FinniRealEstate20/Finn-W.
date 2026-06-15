import { cache } from 'react';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SessionRole = 'broker' | 'buyer' | 'none';

export interface SessionInfo {
  userId: string;
  email: string;
  role: SessionRole;
  orgId: string | null;
}

/**
 * Resolves the active session into { userId, role, orgId }. Cached for
 * the request so Server Components can call it freely without extra DB
 * round-trips. Returns null when no session is present.
 */
export const getSession = cache(async (): Promise<SessionInfo | null> => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [brokerRes, buyerRes] = await Promise.all([
    supabase
      .from('broker_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle<{ org_id: string }>(),
    supabase
      .from('buyer_profiles')
      .select('org_id')
      .eq('user_id', user.id)
      .maybeSingle<{ org_id: string }>(),
  ]);

  if (brokerRes.data) {
    return {
      userId: user.id,
      email: user.email ?? '',
      role: 'broker',
      orgId: brokerRes.data.org_id,
    };
  }
  if (buyerRes.data) {
    return {
      userId: user.id,
      email: user.email ?? '',
      role: 'buyer',
      orgId: buyerRes.data.org_id,
    };
  }
  return {
    userId: user.id,
    email: user.email ?? '',
    role: 'none',
    orgId: null,
  };
});

export async function requireSession(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHENTICATED');
  return session;
}
