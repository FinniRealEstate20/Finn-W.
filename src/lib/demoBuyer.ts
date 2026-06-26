import { cookies } from 'next/headers';

import { mockBroker } from './mockData';
import { buildMilestonesFor } from './milestones';
import type { Buyer, PropertyType } from '@/types';

export const DEMO_BUYER_COOKIE = 'pac-demo-buyer';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const VALID_PROPERTY_TYPES: PropertyType[] = [
  'ownUse',
  'investment-self',
  'investment-managed',
];

export interface DemoBuyerInput {
  name: string;
  email?: string;
  propertyType: PropertyType;
  city: string;
  moveInDate: string;
}

interface StoredDemoBuyer extends DemoBuyerInput {
  createdAt: string;
}

function sanitize(input: DemoBuyerInput): StoredDemoBuyer | null {
  const name = input.name?.trim().slice(0, 80);
  const city = input.city?.trim().slice(0, 80);
  const email = input.email?.trim().slice(0, 120);
  const moveInDate = input.moveInDate?.trim().slice(0, 10);

  if (!name || !city || !moveInDate) return null;
  if (!VALID_PROPERTY_TYPES.includes(input.propertyType)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(moveInDate)) return null;

  return {
    name,
    email: email || undefined,
    propertyType: input.propertyType,
    city,
    moveInDate,
    createdAt: new Date().toISOString(),
  };
}

export async function setDemoBuyer(input: DemoBuyerInput): Promise<boolean> {
  const cleaned = sanitize(input);
  if (!cleaned) return false;
  const store = await cookies();
  store.set(DEMO_BUYER_COOKIE, JSON.stringify(cleaned), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}

export async function clearDemoBuyer(): Promise<void> {
  const store = await cookies();
  store.delete(DEMO_BUYER_COOKIE);
}

export async function readDemoBuyer(): Promise<Buyer | null> {
  const store = await cookies();
  const raw = store.get(DEMO_BUYER_COOKIE)?.value;
  if (!raw) return null;
  let parsed: StoredDemoBuyer;
  try {
    parsed = JSON.parse(raw) as StoredDemoBuyer;
  } catch {
    return null;
  }
  if (!VALID_PROPERTY_TYPES.includes(parsed.propertyType)) return null;

  const milestones = buildMilestonesFor(parsed.propertyType);
  return {
    id: 'demo-self',
    name: parsed.name,
    email: parsed.email ?? 'demo@example.com',
    language: 'de',
    propertyType: parsed.propertyType,
    city: parsed.city,
    address: `${parsed.city}`,
    oldAddress: '',
    moveInDate: parsed.moveInDate,
    brokerId: mockBroker.id,
    milestones,
    profileCompleteness: 40,
    aiChatUsed: false,
    createdAt: parsed.createdAt,
  };
}
