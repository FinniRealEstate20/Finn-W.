import type { DocumentId } from '@/types';
import type { FieldTransform, ProfileKey } from './portalMapping';

export interface RecipeField {
  profileKey: ProfileKey | string;
  label: string;
  selectors: string[];
  transform?: FieldTransform;
  optional?: boolean;
}

export interface PortalRecipe {
  docId: DocumentId;
  portalName: string;
  matchHost: string;
  matchPath?: string;
  fields: RecipeField[];
  postFill?: {
    focusSelector?: string;
    scrollIntoView?: string;
  };
  requiresExtensionFallback?: boolean;
  reviewedAt: string;
  reviewedBy?: string;
  note?: string;
}

export const portalRecipes: readonly PortalRecipe[] = [
  {
    docId: 'wohnsitz-paderborn',
    portalName: 'mein-digiport.de (Wohnsitzanmeldung Paderborn)',
    matchHost: 'mein-digiport.de',
    fields: [
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]', 'input[id*="firstname" i]', '#firstName'] },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]', 'input[id*="lastname" i]', '#lastName'] },
      { profileKey: 'birthDate', label: 'Geburtsdatum', selectors: ['input[type="date"][name*="geburt" i]', 'input[name*="birthdate" i]', '#birthDate'], transform: 'iso-date' },
      { profileKey: 'newStreet', label: 'Neue Straße', selectors: ['input[name*="strasse" i]:not([name*="alt" i])', 'input[id*="newStreet" i]'] },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]:not([name*="alt" i])'] },
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]:not([name*="alt" i])', 'input[name*="postalcode" i]'] },
      { profileKey: 'newCity', label: 'Ort', selectors: ['input[name*="ort" i]:not([name*="alt" i])', 'input[name*="city" i]'] },
      { profileKey: 'email', label: 'E-Mail', selectors: ['input[type="email"]', 'input[name*="mail" i]'], optional: true }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'kfz-paderborn',
    portalName: 'i-Kfz Kreis Paderborn',
    matchHost: 'paderborn.kfz-zulassung-nw.de',
    fields: [
      { profileKey: 'firstName', label: 'Vorname Halter', selectors: ['input[name*="vorname" i]', '#firstname'] },
      { profileKey: 'lastName', label: 'Nachname Halter', selectors: ['input[name*="nachname" i]', '#lastname'] },
      { profileKey: 'newStreet', label: 'Straße', selectors: ['input[name*="strasse" i]', '#street'] },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]'] },
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]'] },
      { profileKey: 'newCity', label: 'Wohnort', selectors: ['input[name*="ort" i]', '#city'] }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'strom-westfalenweser',
    portalName: 'Westfalen Weser Energie',
    matchHost: 'westfalenweser.com',
    fields: [
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]', 'input[name*="firstname" i]'] },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]', 'input[name*="lastname" i]'] },
      { profileKey: 'email', label: 'E-Mail', selectors: ['input[type="email"]'] },
      { profileKey: 'phone', label: 'Telefon', selectors: ['input[type="tel"]', 'input[name*="telefon" i]'], optional: true },
      { profileKey: 'newStreet', label: 'Straße', selectors: ['input[name*="strasse" i]'] },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]'] },
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]'] },
      { profileKey: 'newCity', label: 'Ort', selectors: ['input[name*="ort" i]'] },
      { profileKey: 'iban', label: 'IBAN', selectors: ['input[name*="iban" i]'], transform: 'iban-no-spaces', optional: true },
      { profileKey: 'meterReadingElectricity', label: 'Zählerstand', selectors: ['input[name*="zaehler" i]', 'input[name*="meter" i]'], optional: true }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'gez',
    portalName: 'rundfunkbeitrag.de',
    matchHost: 'rundfunkbeitrag.de',
    fields: [
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]'] },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]', 'input[name*="familienname" i]'] },
      { profileKey: 'birthDate', label: 'Geburtsdatum', selectors: ['input[type="date"]', 'input[name*="geburt" i]'], transform: 'iso-date' },
      { profileKey: 'newStreet', label: 'Straße', selectors: ['input[name*="strasse" i]'] },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]'] },
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]'] },
      { profileKey: 'newCity', label: 'Ort', selectors: ['input[name*="ort" i]'] },
      { profileKey: 'email', label: 'E-Mail', selectors: ['input[type="email"]'], optional: true }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'post',
    portalName: 'Deutsche Post Nachsendeservice',
    matchHost: 'deutschepost.de',
    matchPath: 'nachsendeservice',
    fields: [
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]', 'input[name*="firstname" i]'] },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]', 'input[name*="lastname" i]'] },
      { profileKey: 'oldStreet', label: 'Alte Straße', selectors: ['input[name*="alt" i][name*="strasse" i]', 'input[name*="from" i][name*="street" i]'] },
      { profileKey: 'oldHouseNumber', label: 'Alte Hausnummer', selectors: ['input[name*="alt" i][name*="hausnummer" i]'] },
      { profileKey: 'oldPostalCode', label: 'Alte PLZ', selectors: ['input[name*="alt" i][name*="plz" i]'] },
      { profileKey: 'oldCity', label: 'Alter Ort', selectors: ['input[name*="alt" i][name*="ort" i]'] },
      { profileKey: 'newStreet', label: 'Neue Straße', selectors: ['input[name*="neu" i][name*="strasse" i]', 'input[name*="to" i][name*="street" i]'] },
      { profileKey: 'newHouseNumber', label: 'Neue Hausnummer', selectors: ['input[name*="neu" i][name*="hausnummer" i]'] },
      { profileKey: 'newPostalCode', label: 'Neue PLZ', selectors: ['input[name*="neu" i][name*="plz" i]'] },
      { profileKey: 'newCity', label: 'Neuer Ort', selectors: ['input[name*="neu" i][name*="ort" i]'] },
      { profileKey: 'moveInDate', label: 'Einzugsdatum', selectors: ['input[type="date"]', 'input[name*="datum" i]'], transform: 'iso-date' }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'hausrat',
    portalName: 'Check24 Hausratversicherung',
    matchHost: 'check24.de',
    matchPath: 'hausratversicherung',
    fields: [
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]', 'input[id*="zip" i]'] },
      { profileKey: 'newCity', label: 'Ort', selectors: ['input[name*="ort" i]', 'input[id*="city" i]'] },
      { profileKey: 'newStreet', label: 'Straße', selectors: ['input[name*="strasse" i]'], optional: true },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]'], optional: true },
      { profileKey: 'birthDate', label: 'Geburtsdatum', selectors: ['input[type="date"]', 'input[name*="geburt" i]'], transform: 'iso-date', optional: true }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'gas',
    portalName: 'Westfalen Weser Energie (Gas)',
    matchHost: 'westfalenweser.com',
    matchPath: 'gas',
    fields: [
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]', 'input[name*="firstname" i]'] },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]', 'input[name*="lastname" i]'] },
      { profileKey: 'email', label: 'E-Mail', selectors: ['input[type="email"]'] },
      { profileKey: 'phone', label: 'Telefon', selectors: ['input[type="tel"]', 'input[name*="telefon" i]'], optional: true },
      { profileKey: 'newStreet', label: 'Straße', selectors: ['input[name*="strasse" i]'] },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]'] },
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]'] },
      { profileKey: 'newCity', label: 'Ort', selectors: ['input[name*="ort" i]'] },
      { profileKey: 'iban', label: 'IBAN', selectors: ['input[name*="iban" i]'], transform: 'iban-no-spaces', optional: true },
      { profileKey: 'meterReadingGas', label: 'Gas-Zählerstand', selectors: ['input[name*="zaehler" i]', 'input[name*="meter" i]'], optional: true }
    ],
    reviewedAt: '2026-06-11'
  },
  {
    docId: 'internet',
    portalName: 'Verivox DSL-Vergleich',
    matchHost: 'verivox.de',
    matchPath: 'dsl',
    fields: [
      { profileKey: 'newPostalCode', label: 'PLZ', selectors: ['input[name*="plz" i]', 'input[name*="zip" i]', 'input[id*="postal" i]'] },
      { profileKey: 'newCity', label: 'Ort', selectors: ['input[name*="ort" i]', 'input[name*="city" i]'], optional: true },
      { profileKey: 'newStreet', label: 'Straße', selectors: ['input[name*="strasse" i]', 'input[name*="street" i]'], optional: true },
      { profileKey: 'newHouseNumber', label: 'Hausnummer', selectors: ['input[name*="hausnummer" i]', 'input[name*="number" i]'], optional: true },
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]', 'input[name*="firstname" i]'], optional: true },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]', 'input[name*="lastname" i]'], optional: true },
      { profileKey: 'email', label: 'E-Mail', selectors: ['input[type="email"]'], optional: true }
    ],
    reviewedAt: '2026-06-11',
    note: 'Verivox lädt Felder dynamisch je nach Eingabe – PLZ ist der wichtigste Anker. KI-Mapper greift erfahrungsgemäß für Folgefelder.'
  },
  {
    docId: 'vermieterhaftpflicht',
    portalName: 'Check24 Vermieter-Haftpflicht',
    matchHost: 'check24.de',
    matchPath: 'vermieter-haftpflicht',
    fields: [
      { profileKey: 'newPostalCode', label: 'PLZ Objekt', selectors: ['input[name*="plz" i]', 'input[id*="zip" i]'] },
      { profileKey: 'newCity', label: 'Ort Objekt', selectors: ['input[name*="ort" i]', 'input[id*="city" i]'] },
      { profileKey: 'newStreet', label: 'Straße Objekt', selectors: ['input[name*="strasse" i]'], optional: true },
      { profileKey: 'newHouseNumber', label: 'Hausnummer Objekt', selectors: ['input[name*="hausnummer" i]'], optional: true },
      { profileKey: 'firstName', label: 'Vorname', selectors: ['input[name*="vorname" i]'], optional: true },
      { profileKey: 'lastName', label: 'Nachname', selectors: ['input[name*="nachname" i]'], optional: true },
      { profileKey: 'birthDate', label: 'Geburtsdatum', selectors: ['input[type="date"]', 'input[name*="geburt" i]'], transform: 'iso-date', optional: true },
      { profileKey: 'email', label: 'E-Mail', selectors: ['input[type="email"]'], optional: true }
    ],
    reviewedAt: '2026-06-11'
  }
];

export function findRecipeForHost(host: string, path?: string): PortalRecipe | undefined {
  const normalizedHost = host.replace(/^www\./, '').toLowerCase();
  const normalizedPath = (path ?? '').toLowerCase();
  const candidates = portalRecipes.filter(r => {
    const recipeHost = r.matchHost.replace(/^www\./, '').toLowerCase();
    return normalizedHost === recipeHost || normalizedHost.endsWith(`.${recipeHost}`);
  });
  const withPath = candidates.find(
    r => r.matchPath && normalizedPath.includes(r.matchPath.toLowerCase())
  );
  if (withPath) return withPath;
  return candidates.find(r => !r.matchPath);
}

export function findRecipeForDoc(docId: string): PortalRecipe | undefined {
  return portalRecipes.find(r => r.docId === docId);
}

export const SMART_FILL_DOC_IDS = new Set<DocumentId>(
  portalRecipes.map(r => r.docId)
);

export const SMART_FILL_EXCLUDED: ReadonlySet<DocumentId> = new Set<DocumentId>([
  'grundsteuer'
]);

export function smartFillStatus(
  docId: DocumentId
): 'available' | 'excluded' | 'pending' {
  if (SMART_FILL_EXCLUDED.has(docId)) return 'excluded';
  if (SMART_FILL_DOC_IDS.has(docId)) return 'available';
  return 'pending';
}
