export type LookupOrigin = 'live' | 'cached' | 'mock';

export interface LookupMeta {
  origin: LookupOrigin;
  source: string;
  fetchedAt: string;
  durationMs: number;
}

export interface AddressSuggestion {
  displayName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  district?: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  osmId?: string;
}

export interface PlaceSuggestion {
  postalCode: string;
  city: string;
  district?: string;
  state?: string;
  municipalityKey?: string;
}

export interface StreetSuggestion {
  street: string;
  postalCode: string;
  city: string;
}

export interface LookupResponse<T> {
  meta: LookupMeta;
  results: T[];
}
