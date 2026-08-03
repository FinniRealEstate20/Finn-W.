import type {
  AddressSuggestion,
  LookupResponse,
  PlaceSuggestion,
  StreetSuggestion
} from './types';

export const MOCK_ADDRESSES: AddressSuggestion[] = [
  {
    displayName: 'Neuer Graben 5, 49074 Osnabrück (Innenstadt)',
    street: 'Neuer Graben',
    houseNumber: '5',
    postalCode: '49074',
    city: 'Osnabrück',
    district: 'Innenstadt',
    state: 'Niedersachsen',
    country: 'Deutschland',
    lat: 52.276,
    lng: 8.043,
    osmId: 'mock:1'
  },
  {
    displayName: 'Sutthauser Straße 12, 49080 Osnabrück (Wüste)',
    street: 'Sutthauser Straße',
    houseNumber: '12',
    postalCode: '49080',
    city: 'Osnabrück',
    district: 'Wüste',
    state: 'Niedersachsen',
    country: 'Deutschland',
    lat: 52.263,
    lng: 8.045,
    osmId: 'mock:2'
  },
  {
    displayName: 'Nelson-Mandela-Straße 3, 49076 Osnabrück (Westerberg)',
    street: 'Nelson-Mandela-Straße',
    houseNumber: '3',
    postalCode: '49076',
    city: 'Osnabrück',
    district: 'Westerberg',
    state: 'Niedersachsen',
    country: 'Deutschland',
    lat: 52.284,
    lng: 8.026,
    osmId: 'mock:3'
  },
  {
    displayName: 'Hasestraße 60, 49074 Osnabrück',
    street: 'Hasestraße',
    houseNumber: '60',
    postalCode: '49074',
    city: 'Osnabrück',
    state: 'Niedersachsen',
    country: 'Deutschland',
    lat: 52.279,
    lng: 8.049,
    osmId: 'mock:4'
  },
  {
    displayName: 'Möserstraße 22, 49074 Osnabrück',
    street: 'Möserstraße',
    houseNumber: '22',
    postalCode: '49074',
    city: 'Osnabrück',
    state: 'Niedersachsen',
    country: 'Deutschland',
    lat: 52.271,
    lng: 8.053,
    osmId: 'mock:5'
  }
];

export const MOCK_PLACES: PlaceSuggestion[] = [
  { postalCode: '49074', city: 'Osnabrück', district: 'Innenstadt', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49076', city: 'Osnabrück', district: 'Westerberg', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49078', city: 'Osnabrück', district: 'Nahne', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49080', city: 'Osnabrück', district: 'Wüste', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49082', city: 'Osnabrück', district: 'Voxtrup', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49084', city: 'Osnabrück', district: 'Fledder', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49086', city: 'Osnabrück', district: 'Gretesch', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49088', city: 'Osnabrück', district: 'Haste', state: 'Niedersachsen', municipalityKey: '03404000' },
  { postalCode: '49090', city: 'Osnabrück', district: 'Dodesheide', state: 'Niedersachsen', municipalityKey: '03404000' }
];

export const MOCK_STREETS: StreetSuggestion[] = [
  { street: 'Neuer Graben', postalCode: '49074', city: 'Osnabrück' },
  { street: 'Sutthauser Straße', postalCode: '49080', city: 'Osnabrück' },
  { street: 'Nelson-Mandela-Straße', postalCode: '49076', city: 'Osnabrück' },
  { street: 'Hasestraße', postalCode: '49074', city: 'Osnabrück' },
  { street: 'Möserstraße', postalCode: '49074', city: 'Osnabrück' },
  { street: 'Bramscher Straße', postalCode: '49088', city: 'Osnabrück' },
  { street: 'Bierstraße', postalCode: '49074', city: 'Osnabrück' }
];

export function mockAddressResponse(query: string): LookupResponse<AddressSuggestion> {
  const q = query.toLowerCase();
  const filtered = MOCK_ADDRESSES.filter(a =>
    a.displayName.toLowerCase().includes(q) ||
    a.street.toLowerCase().includes(q) ||
    a.postalCode.includes(q)
  );
  return {
    meta: {
      origin: 'mock',
      source: 'mock:addresses',
      fetchedAt: new Date().toISOString(),
      durationMs: 0
    },
    results: filtered.length > 0 ? filtered : MOCK_ADDRESSES.slice(0, 3)
  };
}

export function mockPlaceResponse(query: string): LookupResponse<PlaceSuggestion> {
  const q = query.toLowerCase();
  const filtered = MOCK_PLACES.filter(p =>
    p.postalCode.includes(q) ||
    p.city.toLowerCase().includes(q) ||
    (p.district ?? '').toLowerCase().includes(q)
  );
  return {
    meta: {
      origin: 'mock',
      source: 'mock:plz',
      fetchedAt: new Date().toISOString(),
      durationMs: 0
    },
    results: filtered.length > 0 ? filtered : MOCK_PLACES.slice(0, 3)
  };
}
