import type { Broker, Buyer } from '@/types';
import { buildMilestonesFor } from './milestones';

export const mockBroker: Broker = {
  id: 'thomas-k',
  name: 'Thomas Kühn',
  company: 'Kühn Immobilien Paderborn',
  city: 'Paderborn',
  email: 'thomas@kuehn-immobilien-pb.de',
  phone: '+49 5251 12345678',
  photoUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  brandColor: '#0469c4',
  googleReviewUrl: 'https://g.page/r/kuehn-immobilien-paderborn/review',
  reviews: {
    total: 18,
    average: 4.9,
    requestsSent: 28,
    lastReviewText:
      'Thomas hat uns auch nach dem Notartermin nicht im Stich gelassen. Der digitale Begleiter war Gold wert – wir wussten immer, was als Nächstes zu tun ist.',
    lastReviewStars: 5
  },
  curatorPoints: {
    currentQuarter: 4,
    totalConfirmed: 12,
    rank: 2
  }
};

const julia: Buyer = (() => {
  const milestones = buildMilestonesFor('ownUse');
  milestones[0].status = 'done';
  milestones[1].status = 'done';
  milestones[2].status = 'done';
  milestones[3].status = 'in_progress';
  return {
    id: 'julia-m',
    name: 'Julia',
    email: 'julia.m@example.de',
    language: 'de',
    propertyType: 'ownUse',
    city: 'Paderborn',
    address: 'Hauptstraße 42, 33102 Paderborn-Schloß Neuhaus',
    oldAddress: 'Bahnhofstraße 12, 33102 Paderborn',
    moveInDate: '2026-08-15',
    brokerId: mockBroker.id,
    milestones,
    profileCompleteness: 65,
    aiChatUsed: true,
    createdAt: '2026-05-02T10:00:00.000Z'
  };
})();

const lukas: Buyer = (() => {
  const milestones = buildMilestonesFor('investment-self');
  milestones[0].status = 'done';
  milestones[1].status = 'done';
  milestones[2].status = 'in_progress';
  return {
    id: 'lukas-b',
    name: 'Lukas',
    email: 'lukas.b@example.de',
    language: 'de',
    propertyType: 'investment-self',
    city: 'Paderborn',
    address: 'Westernmauer 16, 33098 Paderborn-Stadtmitte',
    oldAddress: 'Frankfurter Weg 30, 33102 Paderborn',
    moveInDate: '2026-09-01',
    brokerId: mockBroker.id,
    milestones,
    profileCompleteness: 80,
    aiChatUsed: true,
    createdAt: '2026-05-08T14:30:00.000Z'
  };
})();

const sabine: Buyer = (() => {
  const milestones = buildMilestonesFor('investment-managed');
  milestones[0].status = 'done';
  milestones[1].status = 'done';
  milestones[2].status = 'done';
  milestones[3].status = 'done';
  milestones[4].status = 'in_progress';
  return {
    id: 'sabine-r',
    name: 'Sabine',
    email: 'sabine.r@example.de',
    language: 'de',
    propertyType: 'investment-managed',
    city: 'Paderborn',
    address: 'Riemekestraße 88, 33106 Paderborn',
    oldAddress: 'Detmolder Straße 240, 33100 Paderborn',
    moveInDate: '2026-07-15',
    brokerId: mockBroker.id,
    milestones,
    profileCompleteness: 95,
    aiChatUsed: true,
    createdAt: '2026-04-20T09:00:00.000Z'
  };
})();

export const mockBuyers: readonly Buyer[] = [julia, lukas, sabine];

export function getBuyer(id: string): Buyer | undefined {
  return mockBuyers.find(b => b.id === id);
}

export function getDefaultBuyer(): Buyer {
  return julia;
}

export interface TopCurator {
  rank: number;
  name: string;
  company: string;
  points: number;
}

export const topCurators: readonly TopCurator[] = [
  { rank: 1, name: 'Sabine Berger', company: 'Berger & Partner', points: 6 },
  { rank: 2, name: 'Thomas Kühn', company: 'Kühn Immobilien Paderborn', points: 4 },
  { rank: 3, name: 'Markus Wolff', company: 'Wolff Wohnen', points: 3 },
  { rank: 4, name: 'Anja Schulz', company: 'Schulz Real Estate', points: 2 },
  { rank: 5, name: 'Peter Vogt', company: 'Vogt Immo OWL', points: 1 }
];
