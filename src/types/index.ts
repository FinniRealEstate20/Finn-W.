export type PropertyType = 'ownUse' | 'investment-self' | 'investment-managed';

export type Phase = 1 | 2 | 3 | 4;

export type MilestoneStatus = 'open' | 'in_progress' | 'done';

export type MilestoneId =
  | 'auflassung'
  | 'faelligkeit'
  | 'kaufpreis'
  | 'grunderwerb'
  | 'wohngebaeude'
  | 'handwerker'
  | 'verwaltung'
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
  forPropertyType: PropertyType | 'all';
  dueInDays?: number;
  isCriticalDeadline?: boolean;
}

export type DocumentCategory =
  | 'authorities'
  | 'utilities'
  | 'insurance'
  | 'media'
  | 'rental';

export type FormSourceType = 'inhouse' | 'external_link' | 'communal_pdf';

export type FormStatus = 'active' | 'under_review' | 'outdated';

export type SubmissionMethod = 'in_person' | 'postal' | 'online_portal' | 'email';

export type DocumentId =
  | 'wohnsitz-paderborn'
  | 'kfz-paderborn'
  | 'grundsteuer'
  | 'strom-westfalenweser'
  | 'strom-stadtwerke-pb'
  | 'gas'
  | 'wasser'
  | 'asp-abfall'
  | 'internet'
  | 'wohngebaeude'
  | 'hausrat'
  | 'gez'
  | 'post'
  | 'bank'
  | 'verwaltung'
  | 'mietvertrag'
  | 'vermieterhaftpflicht';

export interface FormEntry {
  id: DocumentId;
  category: DocumentCategory;
  sourceType: FormSourceType;
  officialSource: string;
  status: FormStatus;
  lastCheckedAt: string;
  sourceVersion?: string;
  forPropertyType: PropertyType | 'all';
  region: 'paderborn' | 'nationwide';
  submissionMethod: SubmissionMethod;
  submissionTarget?: string;
  triggerMilestone?: MilestoneId;
  urgencyDays?: number;
  estimatedTimeMin?: number;
  estimatedCost?: string;
  estimatedProcessing?: string;
  consequenceIfMissing?: string;
  prefillCopyFields?: string[];
  externalUrl?: string;
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
  curatorPoints: {
    currentQuarter: number;
    totalConfirmed: number;
    rank?: number;
  };
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  language: 'de';
  propertyType: PropertyType;
  city: string;
  address: string;
  oldAddress: string;
  moveInDate: string;
  brokerId: string;
  milestones: Milestone[];
  profileCompleteness: number;
  aiChatUsed: boolean;
  createdAt: string;
}
