import { cookies } from 'next/headers';
import { mockBuyers, getDefaultBuyer } from './mockData';
import type { Buyer } from '@/types';

export const ACTIVE_BUYER_COOKIE = 'pac-active-buyer';

export async function getActiveBuyer(): Promise<Buyer> {
  const store = await cookies();
  const id = store.get(ACTIVE_BUYER_COOKIE)?.value;
  if (!id) return getDefaultBuyer();
  return mockBuyers.find(b => b.id === id) ?? getDefaultBuyer();
}
