import type {
  AddressSuggestion,
  LookupResponse,
  PlaceSuggestion,
  StreetSuggestion
} from './types';

export const MOCK_ADDRESSES: AddressSuggestion[] = [
  {
    displayName: 'Hauptstraße 42, 33102 Paderborn (Schloß Neuhaus)',
    street: 'Hauptstraße',
    houseNumber: '42',
    postalCode: '33102',
    city: 'Paderborn',
    district: 'Schloß Neuhaus',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    lat: 51.747,
    lng: 8.717,
    osmId: 'mock:1'
  },
  {
    displayName: 'Westernmauer 16, 33098 Paderborn (Stadtmitte)',
    street: 'Westernmauer',
    houseNumber: '16',
    postalCode: '33098',
    city: 'Paderborn',
    district: 'Stadtmitte',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    lat: 51.717,
    lng: 8.755,
    osmId: 'mock:2'
  },
  {
    displayName: 'Riemekestraße 88, 33106 Paderborn',
    street: 'Riemekestraße',
    houseNumber: '88',
    postalCode: '33106',
    city: 'Paderborn',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    lat: 51.706,
    lng: 8.733,
    osmId: 'mock:3'
  },
  {
    displayName: 'Bahnhofstraße 12, 33102 Paderborn',
    street: 'Bahnhofstraße',
    houseNumber: '12',
    postalCode: '33102',
    city: 'Paderborn',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    lat: 51.713,
    lng: 8.749,
    osmId: 'mock:4'
  },
  {
    displayName: 'Frankfurter Weg 30, 33102 Paderborn',
    street: 'Frankfurter Weg',
    houseNumber: '30',
    postalCode: '33102',
    city: 'Paderborn',
    state: 'Nordrhein-Westfalen',
    country: 'Deutschland',
    lat: 51.708,
    lng: 8.736,
    osmId: 'mock:5'
  }
];

export const MOCK_PLACES: PlaceSuggestion[] = [
  { postalCode: '33098', city: 'Paderborn', district: 'Stadtmitte', state: 'Nordrhein-Westfalen', municipalityKey: '05774032' },
  { postalCode: '33100', city: 'Paderborn', district: 'Elsen', state: 'Nordrhein-Westfalen', municipalityKey: '05774032' },
  { postalCode: '33102', city: 'Paderborn', district: 'Schloß Neuhaus', state: 'Nordrhein-Westfalen', municipalityKey: '05774032' },
  { postalCode: '33104', city: 'Paderborn', district: 'Sande', state: 'Nordrhein-Westfalen', municipalityKey: '05774032' },
  { postalCode: '33106', city: 'Paderborn', district: 'Wewer', state: 'Nordrhein-Westfalen', municipalityKey: '05774032' },
  { postalCode: '33098', city: 'Paderborn', district: 'Kernstadt', state: 'Nordrhein-Westfalen', municipalityKey: '05774032' }
];

export const MOCK_STREETS: StreetSuggestion[] = [
  { street: 'Hauptstraße', postalCode: '33102', city: 'Paderborn' },
  { street: 'Westernmauer', postalCode: '33098', city: 'Paderborn' },
  { street: 'Riemekestraße', postalCode: '33106', city: 'Paderborn' },
  { street: 'Bahnhofstraße', postalCode: '33102', city: 'Paderborn' },
  { street: 'Detmolder Straße', postalCode: '33100', city: 'Paderborn' },
  { street: 'Marienplatz', postalCode: '33098', city: 'Paderborn' },
  { street: 'Königstraße', postalCode: '33098', city: 'Paderborn' }
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
