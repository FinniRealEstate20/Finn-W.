import type { DocumentCategory, DocumentItem, PropertyType } from '@/types';

export const documentCatalog: readonly DocumentItem[] = [
  // Behörden
  { id: 'registration', category: 'authorities', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'kfz', category: 'authorities', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'grundsteuer', category: 'authorities', prefillable: true, forPropertyType: 'both' },

  // Versorger
  { id: 'power', category: 'utilities', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'gas', category: 'utilities', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'water', category: 'utilities', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'internet', category: 'utilities', prefillable: true, forPropertyType: 'ownUse' },

  // Versicherungen
  { id: 'buildingInsurance', category: 'insurance', prefillable: true, forPropertyType: 'both' },
  { id: 'contentsInsurance', category: 'insurance', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'liabilityInsurance', category: 'insurance', prefillable: true, forPropertyType: 'ownUse' },
  { id: 'landlordLiability', category: 'insurance', prefillable: true, forPropertyType: 'investment' },

  // Rundfunk & Sonstiges
  { id: 'gez', category: 'media', prefillable: true, forPropertyType: 'ownUse', externalUrl: 'https://www.rundfunkbeitrag.de' },
  { id: 'post', category: 'media', prefillable: true, forPropertyType: 'ownUse', externalUrl: 'https://www.deutschepost.de/nachsenden' },
  { id: 'bank', category: 'media', prefillable: false, forPropertyType: 'both' },

  // Kapitalanlage
  { id: 'propertyManagement', category: 'rental', prefillable: false, forPropertyType: 'investment' },
  { id: 'rentalContract', category: 'rental', prefillable: true, forPropertyType: 'investment' }
];

export const documentCategories: readonly DocumentCategory[] = [
  'authorities',
  'utilities',
  'insurance',
  'media',
  'rental'
];

export function documentsFor(propertyType: PropertyType): DocumentItem[] {
  return documentCatalog.filter(
    d => d.forPropertyType === 'both' || d.forPropertyType === propertyType
  );
}

export function groupByCategory(
  docs: readonly DocumentItem[]
): Record<DocumentCategory, DocumentItem[]> {
  const result: Record<DocumentCategory, DocumentItem[]> = {
    authorities: [],
    utilities: [],
    insurance: [],
    media: [],
    rental: []
  };
  for (const d of docs) result[d.category].push(d);
  return result;
}
