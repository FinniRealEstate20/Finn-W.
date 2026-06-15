import type { ProfileAddress } from '@/lib/profileStore';

/**
 * jsonb shape we store in buyer_profiles.address_new / address_old.
 * Kept identical to ProfileAddress so the round-trip is lossless.
 */
export type StoredAddress = Partial<ProfileAddress>;

export function formatStoredAddress(a: StoredAddress | null | undefined): string {
  if (!a) return '';
  const street = [a.street, a.houseNumber].filter(Boolean).join(' ');
  const place = [a.postalCode, a.city].filter(Boolean).join(' ');
  const district = a.district ? `-${a.district}` : '';
  const placeWithDistrict = place || district ? `${place}${district}` : '';
  return [street, placeWithDistrict].filter(Boolean).join(', ');
}

export function profileAddressFromStored(
  a: StoredAddress | null | undefined
): ProfileAddress {
  return {
    street: a?.street ?? '',
    houseNumber: a?.houseNumber ?? '',
    postalCode: a?.postalCode ?? '',
    city: a?.city ?? '',
    district: a?.district ?? '',
  };
}

export function storedFromProfileAddress(a: ProfileAddress): StoredAddress {
  return {
    street: a.street,
    houseNumber: a.houseNumber,
    postalCode: a.postalCode,
    city: a.city,
    district: a.district,
  };
}
