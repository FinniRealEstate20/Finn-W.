'use server';

import { saveServerProfile } from '@/lib/data/profile';
import { profileCompleteness, type ProfileData } from '@/lib/profile/types';

export async function saveProfileAction(profile: ProfileData): Promise<{ ok: boolean }> {
  const ok = await saveServerProfile({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    birthDate: profile.birthDate,
    steuerId: profile.steuerId,
    iban: profile.iban,
    newAddress: profile.newAddress,
    oldAddress: profile.oldAddress,
    moveInDate: profile.moveInDate,
    propertyType: profile.propertyType,
    meterReadingElectricity: profile.meterReadingElectricity,
    meterReadingGas: profile.meterReadingGas,
    completeness: profileCompleteness(profile),
  });
  return { ok };
}
