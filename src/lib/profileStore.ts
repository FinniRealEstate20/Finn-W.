'use client';

import type { PropertyType } from '@/types';

const STORAGE_PREFIX = 'pac:profile';
const LEGACY_KEY = 'pac:profile:v1';
const FALLBACK_BUYER_ID = 'julia-m';

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

const PROFILE_DEFAULTS: Record<string, ProfileData> = {
  'julia-m': {
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
  },
  'lukas-b': {
    firstName: 'Lukas',
    lastName: 'Beier',
    email: 'lukas.b@example.de',
    phone: '+49 5251 2345678',
    birthDate: '1988-07-22',
    steuerId: '23 456 789 012',
    iban: 'DE12 4006 0000 0987 6543 21',
    newAddress: {
      street: 'Westernmauer',
      houseNumber: '16',
      postalCode: '33098',
      city: 'Paderborn',
      district: 'Stadtmitte'
    },
    oldAddress: {
      street: 'Frankfurter Weg',
      houseNumber: '30',
      postalCode: '33102',
      city: 'Paderborn',
      district: ''
    },
    moveInDate: '2026-09-01',
    propertyType: 'investment-self',
    meterReadingElectricity: '',
    meterReadingGas: '',
    updatedAt: new Date(0).toISOString(),
    source: {}
  },
  'sabine-r': {
    firstName: 'Sabine',
    lastName: 'Reuter',
    email: 'sabine.r@example.de',
    phone: '+49 5251 3456789',
    birthDate: '1979-11-04',
    steuerId: '34 567 890 123',
    iban: 'DE34 4006 0000 0246 8013 57',
    newAddress: {
      street: 'Riemekestraße',
      houseNumber: '88',
      postalCode: '33106',
      city: 'Paderborn',
      district: ''
    },
    oldAddress: {
      street: 'Detmolder Straße',
      houseNumber: '240',
      postalCode: '33100',
      city: 'Paderborn',
      district: ''
    },
    moveInDate: '2026-07-15',
    propertyType: 'investment-managed',
    meterReadingElectricity: '',
    meterReadingGas: '',
    updatedAt: new Date(0).toISOString(),
    source: {}
  }
};

export const DEFAULT_PROFILE = PROFILE_DEFAULTS[FALLBACK_BUYER_ID];

function getActiveBuyerId(): string {
  if (typeof document === 'undefined') return FALLBACK_BUYER_ID;
  const match = document.cookie
    .split('; ')
    .find(c => c.startsWith('pac-active-buyer='));
  if (!match) return FALLBACK_BUYER_ID;
  const id = decodeURIComponent(match.split('=')[1]);
  return PROFILE_DEFAULTS[id] ? id : FALLBACK_BUYER_ID;
}

function keyFor(buyerId: string): string {
  return `${STORAGE_PREFIX}:${buyerId}:v1`;
}

function defaultFor(buyerId: string): ProfileData {
  return PROFILE_DEFAULTS[buyerId] ?? PROFILE_DEFAULTS[FALLBACK_BUYER_ID];
}

function migrateLegacy() {
  if (typeof window === 'undefined') return;
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const targetKey = keyFor(FALLBACK_BUYER_ID);
    if (!window.localStorage.getItem(targetKey)) {
      window.localStorage.setItem(targetKey, legacy);
    }
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

export function loadProfile(): ProfileData {
  if (typeof window === 'undefined') return defaultFor(FALLBACK_BUYER_ID);
  migrateLegacy();
  const buyerId = getActiveBuyerId();
  const fallback = defaultFor(buyerId);
  try {
    const raw = window.localStorage.getItem(keyFor(buyerId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ProfileData>;
    return {
      ...fallback,
      ...parsed,
      newAddress: { ...EMPTY_ADDRESS, ...fallback.newAddress, ...(parsed.newAddress ?? {}) },
      oldAddress: { ...EMPTY_ADDRESS, ...fallback.oldAddress, ...(parsed.oldAddress ?? {}) },
      source: { ...(parsed.source ?? {}) }
    };
  } catch {
    return fallback;
  }
}

export function saveProfile(profile: ProfileData) {
  if (typeof window === 'undefined') return;
  try {
    const buyerId = getActiveBuyerId();
    window.localStorage.setItem(
      keyFor(buyerId),
      JSON.stringify({ ...profile, updatedAt: new Date().toISOString() })
    );
  } catch {
    // ignore
  }
}

export function resetProfile() {
  if (typeof window === 'undefined') return;
  try {
    const buyerId = getActiveBuyerId();
    window.localStorage.removeItem(keyFor(buyerId));
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
