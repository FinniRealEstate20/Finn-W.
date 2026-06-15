import type { PropertyType } from '@/types';

export interface ProfileAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  district?: string;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
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
  updatedAt: string;
  source: {
    newAddress?: string;
    place?: string;
  };
}

/**
 * Pure scoring function — safe to call from server actions and route
 * handlers since it has no DOM dependency.
 */
export function profileCompleteness(p: ProfileData): number {
  const checks: boolean[] = [
    p.firstName.length > 1,
    p.lastName.length > 1,
    /^.+@.+\..+$/.test(p.email),
    p.phone.length > 4,
    p.birthDate.length === 10,
    p.steuerId.replace(/\s/g, '').length >= 10,
    p.iban.replace(/\s/g, '').length >= 18,
    p.newAddress.street.length > 1,
    p.newAddress.houseNumber.length > 0,
    /^\d{5}$/.test(p.newAddress.postalCode),
    p.newAddress.city.length > 1,
    p.oldAddress.street.length > 1,
    p.oldAddress.postalCode.length === 5,
    p.moveInDate.length === 10,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
