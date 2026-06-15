import { getSession } from '@/lib/auth/getUser';
import { activeKeyVersion, decryptPII, encryptPII } from '@/lib/crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProfileAddress, ProfileData } from '@/lib/profile/types';
import type { PropertyType } from '@/types';

import {
  profileAddressFromStored,
  storedFromProfileAddress,
  type StoredAddress,
} from './address';

interface ProfileRow {
  full_name: string;
  email: string;
  phone_enc: string | null;
  birth_date_enc: string | null;
  steuer_id_enc: string | null;
  iban_enc: string | null;
  address_old: StoredAddress | null;
  address_new: StoredAddress | null;
  move_in_date: string | null;
  property_type: PropertyType | null;
  meter_electricity: string | null;
  meter_gas: string | null;
  updated_at: string;
}

const SELECT =
  'full_name, email, phone_enc, birth_date_enc, steuer_id_enc, iban_enc, address_old, address_new, move_in_date, property_type, meter_electricity, meter_gas, updated_at';

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
}

function rowToProfile(row: ProfileRow): ProfileData {
  const { first, last } = splitName(row.full_name);
  return {
    firstName: first,
    lastName: last,
    email: row.email,
    phone: decryptPII(row.phone_enc) ?? '',
    birthDate: decryptPII(row.birth_date_enc) ?? '',
    steuerId: decryptPII(row.steuer_id_enc) ?? '',
    iban: decryptPII(row.iban_enc) ?? '',
    newAddress: profileAddressFromStored(row.address_new),
    oldAddress: profileAddressFromStored(row.address_old),
    moveInDate: row.move_in_date ?? '',
    propertyType: row.property_type ?? 'ownUse',
    meterReadingElectricity: row.meter_electricity ?? '',
    meterReadingGas: row.meter_gas ?? '',
    updatedAt: row.updated_at,
    source: {},
  };
}

export async function loadServerProfile(userId: string): Promise<ProfileData | null> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('buyer_profiles')
    .select(SELECT)
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>();
  if (!data) return null;
  try {
    return rowToProfile(data);
  } catch {
    // Decryption failure (rotated key, corrupted blob). Return the
    // non-PII portion so the editor can still show & repair the rest.
    return rowToProfile({
      ...data,
      phone_enc: null,
      birth_date_enc: null,
      steuer_id_enc: null,
      iban_enc: null,
    });
  }
}

interface SaveProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  steuerId: string;
  iban: string;
  newAddress: ProfileAddress;
  oldAddress: ProfileAddress;
  moveInDate: string;
  propertyType: PropertyType;
  meterReadingElectricity: string;
  meterReadingGas: string;
  completeness: number;
}

export async function saveServerProfile(input: SaveProfileInput): Promise<boolean> {
  const session = await getSession();
  if (!session || session.role !== 'buyer') return false;

  const supabase = createSupabaseServerClient();
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ').trim();

  const { error } = await supabase
    .from('buyer_profiles')
    .update({
      full_name: fullName || session.email,
      phone_enc: encryptPII(input.phone),
      birth_date_enc: encryptPII(input.birthDate),
      steuer_id_enc: encryptPII(input.steuerId),
      iban_enc: encryptPII(input.iban),
      address_new: storedFromProfileAddress(input.newAddress),
      address_old: storedFromProfileAddress(input.oldAddress),
      move_in_date: input.moveInDate || null,
      property_type: input.propertyType,
      meter_electricity: input.meterReadingElectricity || null,
      meter_gas: input.meterReadingGas || null,
      profile_completeness: input.completeness,
      key_version: activeKeyVersion(),
    })
    .eq('user_id', session.userId);

  return !error;
}
