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

  // === Versorger (Osnabrück, mit Hub-Blöcken) ===
  {
    id: 'strom',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.stadtwerke-osnabrueck.de',
    externalUrl: 'https://www.stadtwerke-osnabrueck.de/energie/kontaktformular-umzug-melden',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    triggerMilestone: 'versorger',
    estimatedTimeMin: 15,
    estimatedProcessing: 'sofort',
    prefillCopyFields: [
      'name',
      'newAddress',
      'iban',
      'meters.electricity.meterNumber',
      'meters.electricity.reading',
      'meters.electricity.maLoId',
      'yearlyConsumptionKwh.electricity',
      'moveInDate'
    ],
    hub: {
      pflichtBadge: 'frei',
      kurzStatus:
        'Anmeldung Pflicht, Anbieter frei wählbar. Ohne rechtzeitige Meldung landest du automatisch in der (teureren) Grundversorgung der Stadtwerke Osnabrück.',
      naechsterSchritt:
        'Zählernummer und Stand am Übergabetag sichern, dann Anbieter aussuchen und Umzug melden.',
      deeplinks: [
        {
          kind: 'lokal',
          label: 'Stadtwerke Osnabrück (SWO) — Umzug melden',
          url: 'https://www.stadtwerke-osnabrueck.de/energie/kontaktformular-umzug-melden',
          note: 'Kommunaler Grundversorger, online in ca. 10 Min.'
        },
        {
          kind: 'lokal',
          label: 'EWE — Umzugsformular',
          url: 'https://www.ewe.de/kundenservice/umzug',
          note: 'Regionaler Anbieter, Strom + Gas kombiniert.'
        },
        {
          kind: 'vergleich',
          label: 'Verivox Strom',
          url: 'https://www.verivox.de/strom/',
          urlTemplate: 'https://www.verivox.de/strom/?plz={postalCode}'
        },
        {
          kind: 'vergleich',
          label: 'Check24 Strom',
          url: 'https://www.check24.de/strom/',
          urlTemplate: 'https://www.check24.de/strom/?plz={postalCode}'
        },
        {
          kind: 'vergleich',
          label: 'Bundesnetzagentur Tarifrechner',
          url: 'https://verbraucher.bundesnetzagentur.de/tarifrechner',
          note: 'Neutraler Vergleich der Regulierungsbehörde.'
        }
      ],
      checkliste: [
        'Zählernummer beim Verkäufer erfragen (6–8 Ziffern, steht am Zähler)',
        'Marktlokations-ID (MaLo-ID, 11-stellig) beim Verkäufer erfragen',
        'Zählerstand am Übergabetag ablesen und fotografieren',
        'Einzugsdatum + IBAN für Lastschrift bereithalten',
        'Jahresverbrauch schätzen: EFH ~4.000 kWh, Wohnung ~2.500 kWh'
      ],
      tipps: [
        '24-Stunden-Lieferantenwechsel: seit 06.06.2025 keine rückwirkende Bearbeitung mehr. Mindestens 2 Wochen, ideal 6 Wochen vor Einzug melden.',
        'Vorsicht bei reinen Neukundenbonus-Tarifen — ab Jahr 2 oft teurer als Grundversorgung.',
        'Auf Preisgarantie und Kündigungsfrist achten (mindestens 12 Monate Preisgarantie ist Standard).',
        'Zählerstand-Foto ins Übergabeprotokoll übernehmen — schützt gegen falsche Erstabrechnungen.'
      ],
      deadline: {
        anchor: 'moveInDate',
        offsetDays: -14,
        severity: 'critical',
        message:
          'Ohne rechtzeitige Anmeldung wirst du bei den Stadtwerke Osnabrück automatisch in die teurere Grundversorgung eingestuft. Seit 06.06.2025 keine rückwirkende Bearbeitung mehr.'
      }
    }
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
    estimatedTimeMin: 10,
    prefillCopyFields: [
      'name',
      'newAddress',
      'iban',
      'meters.gas.meterNumber',
      'meters.gas.reading',
      'yearlyConsumptionKwh.gas',
      'livingAreaSqm',
      'moveInDate'
    ],
    hub: {
      pflichtBadge: 'frei',
      conditional: { profileField: 'hasGasConnection', truthy: true },
      kurzStatus:
        'Nur wenn du einen Gasanschluss hast. Freie Anbieter-Wahl, gleiche 24-Stunden-Frist wie Strom — bei den Stadtwerke Osnabrück ausdrücklich auch für Gas.',
      naechsterSchritt:
        'Gaszähler-Nummer und Stand sichern, dann Anbieter aussuchen und Umzug melden.',
      deeplinks: [
        {
          kind: 'lokal',
          label: 'Stadtwerke Osnabrück — Gas anmelden',
          url: 'https://www.stadtwerke-osnabrueck.de/energie/erdgas/anmelden',
          note: 'Kommunaler Grundversorger, online.'
        },
        {
          kind: 'lokal',
          label: 'EWE — Umzugsformular (Strom + Gas)',
          url: 'https://www.ewe.de/kundenservice/umzug'
        },
        {
          kind: 'vergleich',
          label: 'Verivox Gas',
          url: 'https://www.verivox.de/gas/',
          urlTemplate: 'https://www.verivox.de/gas/?plz={postalCode}'
        },
        {
          kind: 'vergleich',
          label: 'Check24 Gas',
          url: 'https://www.check24.de/gas/',
          urlTemplate: 'https://www.check24.de/gas/?plz={postalCode}'
        }
      ],
      checkliste: [
        'Gaszähler-Nummer beim Verkäufer erfragen',
        'Zählerstand am Übergabetag ablesen und fotografieren',
        'IBAN für Lastschrift bereithalten',
        'Jahresverbrauch schätzen: Faustzahl 100–160 kWh pro m² Wohnfläche je nach Dämmung'
      ],
      tipps: [
        '24-Stunden-Lieferantenwechsel gilt auch für Gas — mindestens 2 Wochen vor Einzug melden.',
        'Wenn du Strom bei EWE anmeldest, kannst du Gas im selben Umzugsformular mitmachen.',
        'Bei alten Häusern (vor 1995) Verbrauch eher am oberen Ende ansetzen.'
      ],
      deadline: {
        anchor: 'moveInDate',
        offsetDays: -14,
        severity: 'critical',
        message:
          'Gleicher 24-Stunden-Wechsel wie beim Strom. Ohne rechtzeitige Meldung → Grundversorgung.'
      }
    }
  },
  {
    id: 'wasser',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.stadtwerke-osnabrueck.de',
    externalUrl: 'https://www.stadtwerke-osnabrueck.de/energie/umzug',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'all',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    submissionTarget: 'Stadtwerke Osnabrück – Wasserversorgung',
    triggerMilestone: 'versorger',
    estimatedTimeMin: 10,
    prefillCopyFields: [
      'name',
      'newAddress',
      'iban',
      'meters.water.meterNumber',
      'meters.water.reading',
      'moveInDate'
    ],
    hub: {
      pflichtBadge: 'pflicht',
      kurzStatus:
        'Kommunales Monopol — keine Anbieter-Wahl. Als Eigentümer bist du direkt zuständig, das läuft nicht über Vermieter oder WEG.',
      naechsterSchritt:
        'Wasseruhr-Nummer und Zählerstand mit dem Verkäufer bei Übergabe festhalten, dann bei Stadtwerke anmelden.',
      deeplinks: [
        {
          kind: 'lokal',
          label: 'Stadtwerke Osnabrück — Umzug (Energie & Wasser)',
          url: 'https://www.stadtwerke-osnabrueck.de/energie/umzug',
          note: 'Wasser läuft über das selbe Umzugsformular.'
        }
      ],
      checkliste: [
        'Wasseruhr-Nummer beim Verkäufer notieren',
        'Zählerstand bei Übergabe gemeinsam ablesen und fotografieren',
        'IBAN für Lastschrift bereithalten'
      ],
      tipps: [
        'Zählerstand ins Übergabeprotokoll übernehmen — Grundlage für die korrekte Erstabrechnung.',
        'Anders als bei Strom/Gas gibt es keine Wechselfrist — trotzdem zeitnah melden.',
        'Bei Mehrfamilienhaus mit Zentralzähler: Anmeldung läuft über WEG-Verwalter, nicht dich.'
      ]
    }
  },
  {
    id: 'abwasser',
    category: 'utilities',
    sourceType: 'info_only',
    officialSource: 'https://www.stadtwerke-osnabrueck.de/abwasser',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'all',
    region: 'osnabrueck',
    submissionMethod: 'postal',
    submissionTarget: 'Stadt Osnabrück – Fachbereich Finanzen und Controlling',
    estimatedTimeMin: 0,
    estimatedProcessing: 'läuft mit Eigentümerwechsel',
    hub: {
      pflichtBadge: 'automatisch',
      kurzStatus:
        'Läuft automatisch mit dem Eigentümerwechsel. Kein Vertrag zum Abschließen — du bekommst einen Bescheid der Stadt Osnabrück.',
      naechsterSchritt:
        'Nichts aktiv tun. Auf ersten Gebühren-Bescheid warten, dann prüfen und Lastschrift einrichten.',
      deeplinks: [
        {
          kind: 'lokal',
          label: 'Stadtwerke Osnabrück Netz — Info Abwasser',
          url: 'https://www.stadtwerke-osnabrueck.de/abwasser',
          note: 'Technisches Netz, aber keine Abrechnung.'
        },
        {
          kind: 'kommune',
          label: 'Stadt Osnabrück — Abwassergebühren',
          url: 'https://service.osnabrueck.de/dienstleistungen/-/vr-bis-detail/dienstleistung/13000004/show',
          note: 'Zuständig für die Abrechnung: Fachbereich Finanzen.'
        }
      ],
      checkliste: [
        'Versiegelte Grundstücksfläche kennen (Dach + Einfahrt + Terrassen)',
        'Bescheid nach Zuzug abwarten (kommt meist einige Wochen nach Grundbucheintrag)'
      ],
      tipps: [
        'Schmutzwasser wird nach Frischwasserverbrauch abgerechnet: ca. 3,36 €/m³.',
        'Niederschlagswasser nach versiegelter Fläche: ca. 1,18 €/m². Bei EFH mit Dach + Einfahrt schnell 60–120 € pro Jahr.',
        'Bei Umbauten (Terrasse pflastern etc.) die Fläche der Stadt melden.'
      ]
    }
  },
  {
    id: 'asp-abfall',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://nachhaltig.osnabrueck.de/de/abfall/',
    externalUrl: 'https://nachhaltig.osnabrueck.de/de/abfall/muellabfuhr/abfallbehaelter/',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'all',
    region: 'osnabrueck',
    submissionMethod: 'online_portal',
    submissionTarget: 'Osnabrücker ServiceBetrieb, Hafenringstraße 12, 49090 Osnabrück · 0541 323-3300 · osb@osnabrueck.de',
    estimatedTimeMin: 10,
    estimatedCost: 'variiert nach Behältergröße',
    estimatedProcessing: '5–10 Werktage',
    prefillCopyFields: ['name', 'newAddress', 'householdSize'],
    hub: {
      pflichtBadge: 'pflicht',
      kurzStatus:
        'Kommunale Pflicht, keine Wahl beim Anbieter. Grundstücksbezogen mit Anschluss- und Benutzungszwang — Restmülltonne ist nicht abwählbar.',
      naechsterSchritt:
        'Personenzahl und gewünschte Tonnengröße festlegen, dann beim OSB anmelden.',
      deeplinks: [
        {
          kind: 'kommune',
          label: 'Osnabrücker ServiceBetrieb — Abfallbehälter',
          url: 'https://nachhaltig.osnabrueck.de/de/abfall/muellabfuhr/abfallbehaelter/'
        },
        {
          kind: 'kommune',
          label: 'Service-Portal Osnabrück (Sperrmüll, Tonnengröße ändern)',
          url: 'https://service.osnabrueck.de'
        },
        {
          kind: 'kommune',
          label: 'Abfuhrkalender / OSB-App',
          url: 'https://nachhaltig.osnabrueck.de/de/abfall/muellabfuhr/abfallkalender/'
        }
      ],
      checkliste: [
        'Personenzahl im Haushalt (Tonnengröße hängt davon ab: 40l bei 1–2 Personen, 60l bei bis 3 Personen)',
        'Grundstück / Adresse',
        'Gewünschte Tonnenfarben: grau Restmüll (Pflicht), blau Papier, braun Bio, gelb Verpackungen'
      ],
      tipps: [
        'Restmüll ist nicht abwählbar (Anschluss- und Benutzungszwang).',
        'Leerung im 14-Tage-Rhythmus — Abfuhrkalender in die App laden.',
        'Bei Neubau/Umbau: OSB rechtzeitig kontaktieren, damit die Tonnen zum Einzug stehen.'
      ]
    }
  },
  {
    id: 'internet',
    category: 'utilities',
    sourceType: 'external_link',
    officialSource: 'https://www.verivox.de',
    externalUrl: 'https://www.verivox.de/dsl/',
    externalUrlTemplate: 'https://www.verivox.de/dsl/?plz={postalCode}',
    status: 'active',
    lastCheckedAt: '2026-06-30',
    forPropertyType: 'ownUse',
    region: 'nationwide',
    submissionMethod: 'online_portal',
    estimatedTimeMin: 15,
    estimatedProcessing: '2–6 Wochen (Anschluss)',
    prefillCopyFields: ['name', 'newAddress', 'iban', 'moveInDate'],
    hub: {
      pflichtBadge: 'frei',
      kurzStatus:
        'Freie Wahl, aber die Verfügbarkeit an deiner konkreten Adresse entscheidet — nicht die Marke. Erstmal prüfen was überhaupt geht.',
      naechsterSchritt:
        'Verfügbarkeitscheck an deiner Adresse machen, dann Tarif wählen und Wunsch-Schalttermin auf das Einzugsdatum legen.',
      deeplinks: [
        {
          kind: 'vergleich',
          label: 'Verivox — DSL/Kabel/Glasfaser prüfen',
          url: 'https://www.verivox.de/dsl/',
          urlTemplate: 'https://www.verivox.de/dsl/?plz={postalCode}',
          note: 'Adressgenauer Verfügbarkeitscheck.'
        },
        {
          kind: 'vergleich',
          label: 'Check24 — Internet-Tarife',
          url: 'https://www.check24.de/dsl/',
          urlTemplate: 'https://www.check24.de/dsl/?plz={postalCode}'
        },
        {
          kind: 'lokal',
          label: 'Osnatel — regionaler Anbieter',
          url: 'https://www.osnatel.de/privatkunden/',
          note: 'Regional in Osnabrück verankert, oft Glasfaser-Ausbau.'
        }
      ],
      checkliste: [
        'Neue Adresse für den Verfügbarkeitscheck',
        'Wunsch-Schalttermin = Einzugsdatum',
        'Bei Rufnummernmitnahme: bisheriger Anbieter + Rufnummer',
        'IBAN für Lastschrift bereithalten'
      ],
      tipps: [
        '4–6 Wochen vor Einzug bestellen — Techniker haben oft Wartezeit.',
        'Portierung der alten Rufnummer im Bestellprozess mit angeben.',
        'Auf tatsächliche Bandbreite achten, nicht auf „bis-zu"-Marketing.',
        'Neubau oder Erstbezug: Glasfaser-Verfügbarkeit prüfen, oft günstiger als DSL-Nachrüstung.'
      ],
      deadline: {
        anchor: 'moveInDate',
        offsetDays: -42,
        severity: 'warn',
        message:
          'Techniker-Termine sind knapp. 4–6 Wochen vor Einzug bestellen, sonst Zwischenlösung nötig.'
      }
    }
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
