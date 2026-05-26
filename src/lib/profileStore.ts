'use client';

import type { PropertyType } from '@/types';

const STORAGE_KEY = 'pac:profile:v1';

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

const EMPTY_ADDRESS: ProfileAddress = {
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
  district: ''
};

export const DEFAULT_PROFILE: ProfileData = {
  firstName: 'Julia',
  lastName: 'Müller',
  email: 'julia.m@example.de',
  phone: '+49 5251 1234567',
  birthDate: '1991-03-12',
  steuerId: '12 345 678 901',
  iban: 'DE89 4006 0000 0123 4567 89',
  newAddress: {
    street: 'Hauptstraße',
    houseNumber: '42',
    postalCode: '33102',
    city: 'Paderborn',
    district: 'Schloß Neuhaus'
  },
  oldAddress: {
    street: 'Bahnhofstraße',
    houseNumber: '12',
    postalCode: '33102',
    city: 'Paderborn',
    district: ''
  },
  moveInDate: '2026-08-15',
  propertyType: 'ownUse',
  meterReadingElectricity: '',
  meterReadingGas: '',
  updatedAt: new Date(0).toISOString(),
  source: {}
};

export function loadProfile(): ProfileData {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<ProfileData>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      newAddress: { ...EMPTY_ADDRESS, ...DEFAULT_PROFILE.newAddress, ...(parsed.newAddress ?? {}) },
      oldAddress: { ...EMPTY_ADDRESS, ...DEFAULT_PROFILE.oldAddress, ...(parsed.oldAddress ?? {}) },
      source: { ...(parsed.source ?? {}) }
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: ProfileData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...profile, updatedAt: new Date().toISOString() })
    );
  } catch {
    // ignore
  }
}

export function resetProfile() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function formatAddress(a: ProfileAddress): string {
  const street = [a.street, a.houseNumber].filter(Boolean).join(' ');
  const place = [a.postalCode, a.city].filter(Boolean).join(' ');
  const district = a.district ? `-${a.district}` : '';
  return [street, `${place}${district}`].filter(Boolean).join(', ');
}

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
    p.moveInDate.length === 10
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
