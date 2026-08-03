import type { DocumentCategory, FormEntry, PropertyType } from '@/types';

export const formCatalog: readonly FormEntry[] = [
  // === Behörden Osnabrück ===
  {
    id: 'wohnsitz-osnabrueck',
    category: 'authorities',
    sourceType: 'external_link',
    officialSource: 'https://www.osnabrueck.de/buergeramt',
    externalUrl: 'https://www.osnabrueck.de/buergeramt/wohnsitz-anmeldung',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    submissionTarget: 'buergeramt@osnabrueck.de',
    triggerMilestone: 'ummeldung',
    urgencyDays: 14,
    estimatedTimeMin: 15,
    estimatedCost: 'kostenfrei',
    estimatedProcessing: 'sofort',
    consequenceIfMissing: 'Bußgeld bis 1.000 €',
    prefillCopyFields: ['name', 'birthDate', 'newAddress', 'oldAddress']
  },
  {
    id: 'kfz-osnabrueck',
    category: 'authorities',
    sourceType: 'external_link',
    officialSource: 'https://www.osnabrueck.de/kfz-zulassung',
    externalUrl: 'https://www.i-kfz.de/portal',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 5,
    estimatedCost: '12,60 €',
    estimatedProcessing: '1–3 Werktage',
    prefillCopyFields: ['name', 'newAddress']
  },
  {
    id: 'grundsteuer',
    category: 'authorities',
    sourceType: 'external_link',
    officialSource: 'https://www.elster.de',
    externalUrl: 'https://www.elster.de/eportal/start',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'all',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 30,
    estimatedCost: 'kostenfrei',
    estimatedProcessing: '6–8 Wochen',
    prefillCopyFields: ['name', 'steuerId', 'newAddress']
  },

  // === Versorger ===
  {
    id: 'strom-ewe',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.ewe.de',
    externalUrl: 'https://www.ewe.de/kundenservice/umzug',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    triggerMilestone: 'versorger',
    estimatedTimeMin: 5,
    estimatedProcessing: 'sofort',
    prefillCopyFields: ['name', 'newAddress', 'iban', 'meterReading']
  },
  {
    id: 'strom-swo',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.stadtwerke-osnabrueck.de',
    externalUrl: 'https://www.stadtwerke-osnabrueck.de/energie/strom/anmelden',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    triggerMilestone: 'versorger',
    estimatedTimeMin: 10,
    prefillCopyFields: ['name', 'newAddress', 'iban', 'meterReading']
  },
  {
    id: 'gas',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.stadtwerke-osnabrueck.de',
    externalUrl: 'https://www.stadtwerke-osnabrueck.de/energie/erdgas/anmelden',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 5,
    prefillCopyFields: ['name', 'newAddress', 'iban']
  },
  {
    id: 'wasser',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.stadtwerke-osnabrueck.de',
    externalUrl: 'https://www.stadtwerke-osnabrueck.de/wasser/anmelden',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'investment-self',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    submissionTarget: 'Stadtwerke Osnabrück – Wasserversorgung',
    estimatedTimeMin: 10
  },
  {
    id: 'asp-abfall',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.osnabrueck.de/leben-in-osnabrueck/umwelt-und-natur/abfallwirtschaft.html',
    externalUrl: 'https://www.osnabrueck.de/leben-in-osnabrueck/umwelt-und-natur/abfallwirtschaft.html',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'investment-self',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 10,
    estimatedCost: 'variiert nach Behältergröße',
    estimatedProcessing: '5–10 Werktage'
  },
  {
    id: 'internet',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.verivox.de',
    externalUrl: 'https://www.verivox.de/dsl/',
    externalUrlTemplate: 'https://www.verivox.de/dsl/?plz={postalCode}',
    status: 'active',
    lastCheckedAt: '2026-06-12',
    forPropertyType: 'ownUse',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 10,
    estimatedProcessing: '2–6 Wochen (Anschluss)',
    prefillCopyFields: ['name', 'newAddress']
  },

  // === Versicherungen ===
  {
    id: 'wohngebaeude',
    category: 'insurance',
    sourceType: 'inhouse',
    officialSource: 'gesetzlich §95 VVG',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'all',
    region: 'nationwide',
    submissionMethod: 'postal',
    triggerMilestone: 'wohngebaeude',
    urgencyDays: 30,
    estimatedTimeMin: 15,
    consequenceIfMissing: 'Sonderkündigungsrecht verstreicht – 1 Monat nach Grundbucheintrag'
  },
  {
    id: 'hausrat',
    category: 'insurance',
    sourceType: 'external_link',
    officialSource: 'https://www.check24.de',
    externalUrl: 'https://www.check24.de/hausratversicherung/',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'ownUse',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 10,
    prefillCopyFields: ['name', 'newAddress']
  },
  {
    id: 'vermieterhaftpflicht',
    category: 'insurance',
    sourceType: 'external_link',
    officialSource: 'https://www.check24.de',
    externalUrl: 'https://www.check24.de/vermieter-haftpflichtversicherung/',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'investment-self',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 10
  },

  // === Rundfunk & Sonstiges ===
  {
    id: 'gez',
    category: 'media',
    sourceType: 'inhouse',
    officialSource: 'https://www.rundfunkbeitrag.de',
    externalUrl: 'https://www.rundfunkbeitrag.de/anmelden/',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    sourceVersion: 'RB-Anmeldung 2026',
    forPropertyType: 'ownUse',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 5,
    estimatedCost: '18,36 €/Monat',
    prefillCopyFields: ['name', 'newAddress', 'birthDate']
  },
  {
    id: 'post',
    category: 'media',
    sourceType: 'external_link',
    officialSource: 'https://www.deutschepost.de',
    externalUrl: 'https://www.deutschepost.de/de/n/nachsendeservice.html',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'ownUse',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 5,
    estimatedCost: '32,90 € für 12 Monate',
    prefillCopyFields: ['name', 'oldAddress', 'newAddress']
  },
  {
    id: 'bank',
    category: 'media',
    sourceType: 'inhouse',
    officialSource: 'Checkliste PropAfterCare',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'all',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 30
  },

  // === Kapitalanlage ===
  {
    id: 'verwaltung',
    category: 'rental',
    sourceType: 'inhouse',
    officialSource: 'PropAfterCare Partnernetzwerk',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    forPropertyType: 'investment-managed',
    region: 'osnabrueck',
    submissionMethod: 'email',
    triggerMilestone: 'verwaltung',
    estimatedTimeMin: 20
  },
  {
    id: 'mietvertrag',
    category: 'rental',
    sourceType: 'inhouse',
    officialSource: 'Rechtlich geprüftes Template',
    status: 'active',
    lastCheckedAt: '2026-05-19',
    sourceVersion: 'Mietvertrag 2026-Q2',
    forPropertyType: 'investment-self',
    region: 'nationwide',
    submissionMethod: 'postal',
    triggerMilestone: 'mietvertrag',
    estimatedTimeMin: 45
  }
];

export const documentCategories: readonly DocumentCategory[] = [
  'authorities',
  'utilities',
  'insurance',
  'media',
  'rental'
];

export function formsFor(propertyType: PropertyType): FormEntry[] {
  return formCatalog.filter(
    f => f.forPropertyType === 'all' || f.forPropertyType === propertyType
  );
}

export function groupByCategory(
  forms: readonly FormEntry[]
): Record<DocumentCategory, FormEntry[]> {
  const result: Record<DocumentCategory, FormEntry[]> = {
    authorities: [],
    utilities: [],
    insurance: [],
    media: [],
    rental: []
  };
  for (const f of forms) result[f.category].push(f);
  return result;
}

export function getForm(id: string): FormEntry | undefined {
  return formCatalog.find(f => f.id === id);
}

export function formForMilestone(
  milestoneId: string,
  propertyType: PropertyType
): FormEntry | undefined {
  const candidates = formCatalog.filter(f => f.triggerMilestone === milestoneId);
  return (
    candidates.find(f => f.forPropertyType === propertyType) ??
    candidates.find(f => f.forPropertyType === 'all') ??
    candidates[0]
  );
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
