import type { Buyer } from '@/types';
import type { ProfileAddress, ProfileData } from './profileStore';

function parseAddress(raw: string): ProfileAddress {
  const empty: ProfileAddress = {
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    district: ''
  };
  if (!raw) return empty;
  const [streetPart = '', placePart = ''] = raw.split(',').map(s => s.trim());
  const streetMatch = streetPart.match(/^(.+?)\s+(\d+\s*[a-zA-Z]?)$/);
  const street = streetMatch ? streetMatch[1] : streetPart;
  const houseNumber = streetMatch ? streetMatch[2] : '';
  const placeMatch = placePart.match(/^(\d{5})\s+(.+)$/);
  const postalCode = placeMatch ? placeMatch[1] : '';
  let city = placeMatch ? placeMatch[2] : placePart;
  let district = '';
  if (city.includes('-')) {
    const [base, ...rest] = city.split('-');
    city = base.trim();
    district = rest.join('-').trim();
  }
  return { street, houseNumber, postalCode, city, district };
}

const DEMO_IBANS: Record<string, string> = {
  'julia-m': 'DE89 4006 0000 0123 4567 89',
  'lukas-b': 'DE12 4006 0000 0987 6543 21',
  'sabine-r': 'DE34 4006 0000 0246 8013 57'
};

const DEMO_STEUER_IDS: Record<string, string> = {
  'julia-m': '12 345 678 901',
  'lukas-b': '23 456 789 012',
  'sabine-r': '34 567 890 123'
};

const DEMO_BIRTHDATES: Record<string, string> = {
  'julia-m': '1991-03-12',
  'lukas-b': '1988-07-22',
  'sabine-r': '1979-11-04'
};

const DEMO_PHONES: Record<string, string> = {
  'julia-m': '+49 5251 1234567',
  'lukas-b': '+49 5251 2345678',
  'sabine-r': '+49 5251 3456789'
};

export function buildServerProfile(buyer: Buyer): ProfileData {
  const [firstName = '', ...rest] = buyer.name.split(' ');
  return {
    firstName,
    lastName: rest.join(' ') || (buyer.id === 'julia-m' ? 'Müller' : ''),
    email: buyer.email,
    phone: DEMO_PHONES[buyer.id] ?? '',
    birthDate: DEMO_BIRTHDATES[buyer.id] ?? '',
    steuerId: DEMO_STEUER_IDS[buyer.id] ?? '',
    iban: DEMO_IBANS[buyer.id] ?? '',
    newAddress: parseAddress(buyer.address),
    oldAddress: parseAddress(buyer.oldAddress),
    moveInDate: buyer.moveInDate,
    propertyType: buyer.propertyType,
    meterReadingElectricity: '',
    meterReadingGas: '',
    updatedAt: new Date(0).toISOString(),
    source: {}
  };
}
