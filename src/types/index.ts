export type PropertyType = 'ownUse' | 'investment';

export type Phase = 1 | 2 | 3 | 4;

export type MilestoneStatus = 'open' | 'in_progress' | 'done';

export type MilestoneId =
  | 'auflassung'
  | 'faelligkeit'
  | 'kaufpreis'
  | 'grunderwerb'
  | 'wohngebaeude'
  | 'handwerker'
  | 'uebergabe'
  | 'ummeldung'
  | 'versorger'
  | 'mietvertrag'
  | 'afa'
  | 'nebenkosten';

export interface Milestone {
  id: MilestoneId;
  phase: Phase;
  status: MilestoneStatus;
  forPropertyType: PropertyType | 'both';
  dueInDays?: number;
}

export type DocumentCategory =
  | 'authorities'
  | 'utilities'
  | 'insurance'
  | 'media'
  | 'rental';

export type DocumentId =
  | 'registration'
  | 'kfz'
  | 'grundsteuer'
  | 'power'
  | 'gas'
  | 'water'
  | 'internet'
  | 'buildingInsurance'
  | 'contentsInsurance'
  | 'liabilityInsurance'
  | 'gez'
  | 'post'
  | 'bank'
  | 'propertyManagement'
  | 'rentalContract'
  | 'landlordLiability';

export interface DocumentItem {
  id: DocumentId;
  category: DocumentCategory;
  prefillable: boolean;
  externalUrl?: string;
  forPropertyType: PropertyType | 'both';
}

export interface Broker {
  id: string;
  name: string;
  company: string;
  city: string;
  email: string;
  phone: string;
  photoUrl: string;
  brandColor: string;
  googleReviewUrl: string;
  reviews: {
    total: number;
    average: number;
    requestsSent: number;
    lastReviewText: string;
    lastReviewStars: number;
  };
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  language: 'de' | 'tr' | 'ar' | 'ru';
  propertyType: PropertyType;
  city: string;
  address: string;
  oldAddress: string;
  moveInDate: string;
  brokerId: string;
  milestones: Milestone[];
  createdAt: string;
}
