import type { Milestone, MilestoneId, Phase, PropertyType } from '@/types';

interface MilestoneTemplate {
  id: MilestoneId;
  phase: Phase;
  forPropertyType: PropertyType | 'both';
  dueInDays: number;
}

export const milestoneCatalog: readonly MilestoneTemplate[] = [
  { id: 'auflassung', phase: 1, forPropertyType: 'both', dueInDays: 14 },
  { id: 'faelligkeit', phase: 1, forPropertyType: 'both', dueInDays: 21 },
  { id: 'kaufpreis', phase: 1, forPropertyType: 'both', dueInDays: 28 },
  { id: 'grunderwerb', phase: 1, forPropertyType: 'both', dueInDays: 35 },
  { id: 'wohngebaeude', phase: 2, forPropertyType: 'both', dueInDays: 45 },
  { id: 'handwerker', phase: 2, forPropertyType: 'both', dueInDays: 60 },
  { id: 'mietvertrag', phase: 2, forPropertyType: 'investment', dueInDays: 70 },
  { id: 'uebergabe', phase: 3, forPropertyType: 'both', dueInDays: 80 },
  { id: 'ummeldung', phase: 3, forPropertyType: 'ownUse', dueInDays: 90 },
  { id: 'versorger', phase: 3, forPropertyType: 'both', dueInDays: 85 },
  { id: 'afa', phase: 4, forPropertyType: 'investment', dueInDays: 180 },
  { id: 'nebenkosten', phase: 4, forPropertyType: 'investment', dueInDays: 365 }
];

export function buildMilestonesFor(propertyType: PropertyType): Milestone[] {
  return milestoneCatalog
    .filter(m => m.forPropertyType === 'both' || m.forPropertyType === propertyType)
    .map(m => ({
      id: m.id,
      phase: m.phase,
      forPropertyType: m.forPropertyType,
      dueInDays: m.dueInDays,
      status: 'open' as const
    }));
}

export function progressFor(milestones: readonly Milestone[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = milestones.length;
  const done = milestones.filter(m => m.status === 'done').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function milestonesByPhase(milestones: readonly Milestone[]): Record<Phase, Milestone[]> {
  const result: Record<Phase, Milestone[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const m of milestones) result[m.phase].push(m);
  return result;
}
