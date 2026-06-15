import { cookies } from 'next/headers';

import { getSessionBuyer } from '@/lib/data/buyers';
import type { Buyer } from '@/types';

import { mockBuyers, getDefaultBuyer } from './mockData';

export const ACTIVE_BUYER_COOKIE = 'pac-active-buyer';

/**
 * Returns the buyer the current request should render for. Priority:
 *   1. The signed-in buyer's real profile (when a buyer session exists)
 *   2. The mock buyer pinned via the cookie (demo / broker preview mode)
 *   3. The default mock buyer (Julia)
 */
export async function getActiveBuyer(): Promise<Buyer> {
  try {
    const real = await getSessionBuyer();
    if (real) return real;
  } catch {
    // Supabase config or query failure — fall through to the mock path
    // so the marketing / demo experience never blanks out.
  }

  const store = await cookies();
  const id = store.get(ACTIVE_BUYER_COOKIE)?.value;
  if (!id) return getDefaultBuyer();
  return mockBuyers.find(b => b.id === id) ?? getDefaultBuyer();
}
