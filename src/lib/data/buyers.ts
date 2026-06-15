import { getSession } from '@/lib/auth/getUser';
import { decryptPII } from '@/lib/crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Buyer, PropertyType } from '@/types';

import { formatStoredAddress, type StoredAddress } from './address';

interface BuyerRow {
  user_id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone_enc: string | null;
  address_old: StoredAddress | null;
  address_new: StoredAddress | null;
  move_in_date: string | null;
  property_type: PropertyType | null;
  profile_completeness: number;
  created_at: string;
}

const SELECT =
  'user_id, org_id, full_name, email, phone_enc, address_old, address_new, move_in_date, property_type, profile_completeness, created_at';

function rowToBuyer(row: BuyerRow): Buyer {
  return {
    id: row.user_id,
    name: row.full_name,
    email: row.email,
    language: 'de',
    propertyType: row.property_type ?? 'ownUse',
    city: row.address_new?.city ?? '',
    address: formatStoredAddress(row.address_new),
    oldAddress: formatStoredAddress(row.address_old),
    moveInDate: row.move_in_date ?? '',
    brokerId: row.org_id,
    milestones: [],
    profileCompleteness: row.profile_completeness,
    aiChatUsed: false,
    createdAt: row.created_at,
  };
}

/**
 * Returns the signed-in buyer or null if the session belongs to a broker
 * or no one. Server-only — relies on supabase auth cookies.
 */
export async function getSessionBuyer(): Promise<Buyer | null> {
  const session = await getSession();
  if (!session || session.role !== 'buyer') return null;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('buyer_profiles')
    .select(SELECT)
    .eq('user_id', session.userId)
    .maybeSingle<BuyerRow>();
  return data ? rowToBuyer(data) : null;
}

/**
 * Broker view: list all buyers in the broker's org. Decrypts nothing —
 * this is a roster summary, not detail.
 */
export async function listOrgBuyers(orgId: string): Promise<Buyer[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('buyer_profiles')
    .select(SELECT)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(rowToBuyer);
}

/**
 * Load a single buyer for the broker view, including the decrypted phone
 * number (other PII stays opaque unless the broker needs it for a form).
 */
export async function getBuyerForBroker(
  buyerId: string,
  orgId: string
): Promise<(Buyer & { phone: string | null }) | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('buyer_profiles')
    .select(SELECT)
    .eq('user_id', buyerId)
    .eq('org_id', orgId)
    .maybeSingle<BuyerRow>();
  if (!data) return null;
  return {
    ...rowToBuyer(data),
    phone: data.phone_enc ? decryptPII(data.phone_enc) : null,
  };
}
