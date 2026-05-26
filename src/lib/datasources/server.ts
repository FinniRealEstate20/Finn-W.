import type {
  AddressSuggestion,
  LookupMeta,
  LookupResponse,
  PlaceSuggestion
} from './types';
import { mockAddressResponse, mockPlaceResponse } from './mock';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OPENPLZ_URL = 'https://openplzapi.org/de/Localities';
const USER_AGENT = 'PropAfterCare-Demo/0.1 (contact: finn.luca.wenzel@gmx.de)';
const FETCH_TIMEOUT_MS = 3500;

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Lookup timeout after ${ms}ms`)), ms)
    )
  ]);
}

function buildMeta(origin: 'live' | 'mock', source: string, started: number): LookupMeta {
  return {
    origin,
    source,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - started
  };
}

interface NominatimEntry {
  osm_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    postcode?: string;
    village?: string;
    town?: string;
    city?: string;
    suburb?: string;
    city_district?: string;
    state?: string;
    country?: string;
  };
}

export async function searchAddress(
  query: string,
  countryCode = 'de'
): Promise<LookupResponse<AddressSuggestion>> {
  const started = Date.now();
  if (!query || query.trim().length < 2) {
    return { meta: buildMeta('mock', 'noop', started), results: [] };
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '6');
  url.searchParams.set('countrycodes', countryCode);
  url.searchParams.set('accept-language', 'de');

  try {
    const res = await withTimeout(
      fetch(url.toString(), {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        next: { revalidate: 60 }
      }),
      FETCH_TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = (await res.json()) as NominatimEntry[];
    const results: AddressSuggestion[] = data.map(d => ({
      displayName: d.display_name,
      street: d.address?.road ?? '',
      houseNumber: d.address?.house_number ?? '',
      postalCode: d.address?.postcode ?? '',
      city: d.address?.city ?? d.address?.town ?? d.address?.village ?? '',
      district: d.address?.suburb ?? d.address?.city_district,
      state: d.address?.state,
      country: d.address?.country,
      lat: Number(d.lat),
      lng: Number(d.lon),
      osmId: d.osm_id ? `osm:${d.osm_id}` : undefined
    }));
    return {
      meta: buildMeta('live', 'nominatim.openstreetmap.org', started),
      results
    };
  } catch (err) {
    console.warn('[lookup] address: falling back to mock —', (err as Error).message);
    const fallback = mockAddressResponse(query);
    fallback.meta = {
      ...fallback.meta,
      origin: 'mock',
      source: 'mock:nominatim-failed',
      durationMs: Date.now() - started
    };
    return fallback;
  }
}

interface OpenPlzLocality {
  postalCode: string;
  name: string;
  district?: { name?: string; key?: string };
  federalState?: { name?: string };
  municipalityKey?: string;
}

export async function searchPlace(
  query: string
): Promise<LookupResponse<PlaceSuggestion>> {
  const started = Date.now();
  if (!query || query.trim().length < 2) {
    return { meta: buildMeta('mock', 'noop', started), results: [] };
  }

  const isPostal = /^\d{2,5}$/.test(query.trim());
  const url = new URL(OPENPLZ_URL);
  if (isPostal) url.searchParams.set('postalCode', query.trim());
  else url.searchParams.set('name', query.trim());
  url.searchParams.set('page', '1');
  url.searchParams.set('pageSize', '8');

  try {
    const res = await withTimeout(
      fetch(url.toString(), {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        next: { revalidate: 300 }
      }),
      FETCH_TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`OpenPLZ HTTP ${res.status}`);
    const data = (await res.json()) as OpenPlzLocality[];
    const results: PlaceSuggestion[] = data.map(d => ({
      postalCode: d.postalCode,
      city: d.name,
      district: d.district?.name,
      state: d.federalState?.name,
      municipalityKey: d.municipalityKey
    }));
    return {
      meta: buildMeta('live', 'openplzapi.org', started),
      results
    };
  } catch (err) {
    console.warn('[lookup] place: falling back to mock —', (err as Error).message);
    const fallback = mockPlaceResponse(query);
    fallback.meta = {
      ...fallback.meta,
      origin: 'mock',
      source: 'mock:openplz-failed',
      durationMs: Date.now() - started
    };
    return fallback;
  }
}
