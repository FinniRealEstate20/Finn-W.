import { cookies } from 'next/headers';

import { getSessionBuyer } from '@/lib/data/buyers';
import { DEMO_SELF_ID, readDemoBuyer } from '@/lib/demoBuyer';
import type { Buyer } from '@/types';

import { mockBuyers, getDefaultBuyer } from './mockData';

export const ACTIVE_BUYER_COOKIE = 'pac-active-buyer';

/**
 * Returns the buyer the current request should render for. Priority:
 *   1. The signed-in buyer's real profile
 *   2. The id pinned in pac-active-buyer — either a mockBuyer or the
 *      special 'demo-self' marker (which renders from pac-demo-buyer)
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
  if (id === DEMO_SELF_ID) {
    return (await readDemoBuyer()) ?? getDefaultBuyer();
  }
  if (!id) return getDefaultBuyer();
  return mockBuyers.find(b => b.id === id) ?? getDefaultBuyer();
}
