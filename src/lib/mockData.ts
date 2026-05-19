import type { Broker, Buyer } from '@/types';
import { buildMilestonesFor } from './milestones';

export const mockBroker: Broker = {
  id: 'thomas-k',
  name: 'Thomas Kühn',
  company: 'Kühn Immobilien Frankfurt',
  city: 'Frankfurt am Main',
  email: 'thomas@kuehn-immobilien.de',
  phone: '+49 69 12345678',
  photoUrl:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  brandColor: '#0469c4',
  googleReviewUrl: 'https://g.page/r/kuehn-immobilien/review',
  reviews: {
    total: 23,
    average: 4.8,
    requestsSent: 41,
    lastReviewText:
      'Thomas hat uns auch nach dem Notartermin nicht im Stich gelassen. Der digitale Begleiter war Gold wert – wir wussten immer, was als Nächstes zu tun ist.',
    lastReviewStars: 5
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
    city: 'München',
    address: 'Lindwurmstraße 42, 80337 München',
    oldAddress: 'Schwanthalerstraße 12, 80336 München',
    moveInDate: '2026-06-15',
    brokerId: mockBroker.id,
    milestones,
    createdAt: '2026-05-02T10:00:00.000Z'
  };
})();

const yilmaz: Buyer = (() => {
  const milestones = buildMilestonesFor('investment');
  milestones[0].status = 'done';
  milestones[1].status = 'done';
  milestones[2].status = 'in_progress';
  return {
    id: 'yilmaz-a',
    name: 'Yılmaz',
    email: 'yilmaz.a@example.de',
    language: 'de',
    propertyType: 'investment',
    city: 'Frankfurt am Main',
    address: 'Hanauer Landstraße 88, 60314 Frankfurt am Main',
    oldAddress: 'Berger Straße 145, 60385 Frankfurt am Main',
    moveInDate: '2026-07-01',
    brokerId: mockBroker.id,
    milestones,
    createdAt: '2026-05-08T14:30:00.000Z'
  };
})();

export const mockBuyers: readonly Buyer[] = [julia, yilmaz];

export function getBuyer(id: string): Buyer | undefined {
  return mockBuyers.find(b => b.id === id);
}

export function getDefaultBuyer(): Buyer {
  return julia;
}
