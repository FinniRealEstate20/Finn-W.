'use client';

import type {
  AddressSuggestion,
  LookupResponse,
  PlaceSuggestion
} from './types';

async function getJson<T>(path: string): Promise<LookupResponse<T>> {
  const res = await fetch(path, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Lookup ${path} failed: HTTP ${res.status}`);
  return (await res.json()) as LookupResponse<T>;
}

export async function lookupAddress(
  query: string
): Promise<LookupResponse<AddressSuggestion>> {
  return getJson<AddressSuggestion>(
    `/api/lookup/address?q=${encodeURIComponent(query)}`
  );
}

export async function lookupPlace(
  query: string
): Promise<LookupResponse<PlaceSuggestion>> {
  return getJson<PlaceSuggestion>(
    `/api/lookup/place?q=${encodeURIComponent(query)}`
  );
}
