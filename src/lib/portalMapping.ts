import { formatAddress, type ProfileData } from './profileStore';

export type ProfileKey =
  | 'name'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'birthDate'
  | 'iban'
  | 'steuerId'
  | 'meterReading'
  | 'meterReadingElectricity'
  | 'meterReadingGas'
  | 'moveInDate'
  | 'newAddress'
  | 'newStreet'
  | 'newHouseNumber'
  | 'newPostalCode'
  | 'newCity'
  | 'newDistrict'
  | 'oldAddress'
  | 'oldStreet'
  | 'oldHouseNumber'
  | 'oldPostalCode'
  | 'oldCity'
  | 'rundfunkBeitragsnummer';

function readNested(profile: ProfileData, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, seg) => {
    if (acc && typeof acc === 'object' && seg in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[seg];
    }
    return undefined;
  }, profile);
}

export function valueFromProfile(profile: ProfileData, key: string): string {
  if (key.includes('.')) {
    const v = readNested(profile, key);
    if (v === undefined || v === null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  }
  switch (key as ProfileKey) {
    case 'name':
      return `${profile.firstName} ${profile.lastName}`.trim();
    case 'firstName':
      return profile.firstName;
    case 'lastName':
      return profile.lastName;
    case 'email':
      return profile.email;
    case 'phone':
      return profile.phone;
    case 'birthDate':
      return profile.birthDate;
    case 'iban':
      return profile.iban;
    case 'steuerId':
      return profile.steuerId;
    case 'meterReading':
      return profile.meterReadingElectricity || profile.meterReadingGas || '';
    case 'meterReadingElectricity':
      return profile.meterReadingElectricity;
    case 'meterReadingGas':
      return profile.meterReadingGas;
    case 'moveInDate':
      return profile.moveInDate;
    case 'newAddress':
      return formatAddress(profile.newAddress);
    case 'newStreet':
      return profile.newAddress.street;
    case 'newHouseNumber':
      return profile.newAddress.houseNumber;
    case 'newPostalCode':
      return profile.newAddress.postalCode;
    case 'newCity':
      return profile.newAddress.city;
    case 'newDistrict':
      return profile.newAddress.district ?? '';
    case 'oldAddress':
      return formatAddress(profile.oldAddress);
    case 'oldStreet':
      return profile.oldAddress.street;
    case 'oldHouseNumber':
      return profile.oldAddress.houseNumber;
    case 'oldPostalCode':
      return profile.oldAddress.postalCode;
    case 'oldCity':
      return profile.oldAddress.city;
    case 'rundfunkBeitragsnummer':
      return profile.rundfunkBeitragsnummer ?? '';
    default:
      return '';
  }
}

export function setValueOnProfile(
  profile: ProfileData,
  key: string,
  raw: string
): ProfileData {
  switch (key as ProfileKey) {
    case 'name': {
      const [first = '', ...rest] = raw.split(' ');
      return { ...profile, firstName: first, lastName: rest.join(' ') };
    }
    case 'firstName':
      return { ...profile, firstName: raw };
    case 'lastName':
      return { ...profile, lastName: raw };
    case 'birthDate':
      return { ...profile, birthDate: raw };
    case 'iban':
      return { ...profile, iban: raw };
    case 'steuerId':
      return { ...profile, steuerId: raw };
    case 'email':
      return { ...profile, email: raw };
    case 'phone':
      return { ...profile, phone: raw };
    case 'meterReading':
    case 'meterReadingElectricity':
      return { ...profile, meterReadingElectricity: raw };
    case 'meterReadingGas':
      return { ...profile, meterReadingGas: raw };
    case 'rundfunkBeitragsnummer':
      return { ...profile, rundfunkBeitragsnummer: raw };
    default:
      return profile;
  }
}

export type FieldTransform = 'iso-date' | 'de-date' | 'iban-no-spaces' | 'upper' | 'digits-only';

export function transformValue(raw: string, transform?: FieldTransform): string {
  if (!raw) return raw;
  switch (transform) {
    case 'iso-date':
      return raw;
    case 'de-date': {
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? `${m[3]}.${m[2]}.${m[1]}` : raw;
    }
    case 'iban-no-spaces':
      return raw.replace(/\s+/g, '');
    case 'upper':
      return raw.toUpperCase();
    case 'digits-only':
      return raw.replace(/\D+/g, '');
    default:
      return raw;
  }
}

