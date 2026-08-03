'use client';

export type { ProfileAddress, ProfileData } from './profile/types';
export { profileCompleteness } from './profile/types';

const STORAGE_PREFIX = 'pac:profile';
const LEGACY_KEY = 'pac:profile:v1';
const FALLBACK_BUYER_ID = 'julia-m';

import type { ProfileAddress, ProfileData } from './profile/types';

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
    phone: '+49 541 1234567',
    birthDate: '1991-03-12',
    steuerId: '12 345 678 901',
    iban: 'DE89 2655 0105 0000 0123 45',
    newAddress: {
      street: 'Neuer Graben',
      houseNumber: '5',
      postalCode: '49074',
      city: 'Osnabrück',
      district: 'Innenstadt'
    },
    oldAddress: {
      street: 'Hasestraße',
      houseNumber: '60',
      postalCode: '49074',
      city: 'Osnabrück',
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
    phone: '+49 541 2345678',
    birthDate: '1988-07-22',
    steuerId: '23 456 789 012',
    iban: 'DE12 2655 0105 0000 0987 65',
    newAddress: {
      street: 'Sutthauser Straße',
      houseNumber: '12',
      postalCode: '49080',
      city: 'Osnabrück',
      district: 'Wüste'
    },
    oldAddress: {
      street: 'Möserstraße',
      houseNumber: '22',
      postalCode: '49074',
      city: 'Osnabrück',
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
    phone: '+49 541 3456789',
    birthDate: '1979-11-04',
    steuerId: '34 567 890 123',
    iban: 'DE34 2655 0105 0000 0246 80',
    newAddress: {
      street: 'Nelson-Mandela-Straße',
      houseNumber: '3',
      postalCode: '49076',
      city: 'Osnabrück',
      district: 'Westerberg'
    },
    oldAddress: {
      street: 'Bramscher Straße',
      houseNumber: '100',
      postalCode: '49088',
      city: 'Osnabrück',
      district: 'Haste'
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

function onboardingKey(buyerId: string): string {
  return `pac:profile:onboarded:${buyerId}`;
}

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return !!window.localStorage.getItem(onboardingKey(getActiveBuyerId()));
  } catch {
    return true;
  }
}

export function markOnboarded() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(onboardingKey(getActiveBuyerId()), new Date().toISOString());
  } catch {
    // ignore
  }
}

export function resetOnboarded() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(onboardingKey(getActiveBuyerId()));
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

