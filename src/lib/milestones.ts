import type { Milestone, MilestoneId, Phase, PropertyType } from '@/types';

interface MilestoneTemplate {
  id: MilestoneId;
  phase: Phase;
  forPropertyType: PropertyType | 'all';
  dueInDays: number;
  isCriticalDeadline?: boolean;
}

export const milestoneCatalog: readonly MilestoneTemplate[] = [
  { id: 'auflassung', phase: 1, forPropertyType: 'all', dueInDays: 14 },
  { id: 'faelligkeit', phase: 1, forPropertyType: 'all', dueInDays: 21 },
  { id: 'kaufpreis', phase: 1, forPropertyType: 'all', dueInDays: 28, isCriticalDeadline: true },
  { id: 'grunderwerb', phase: 1, forPropertyType: 'all', dueInDays: 45, isCriticalDeadline: true },
  { id: 'wohngebaeude', phase: 2, forPropertyType: 'all', dueInDays: 50, isCriticalDeadline: true },
  { id: 'handwerker', phase: 2, forPropertyType: 'ownUse', dueInDays: 60 },
  { id: 'verwaltung', phase: 2, forPropertyType: 'investment-managed', dueInDays: 55 },
  { id: 'mietvertrag', phase: 2, forPropertyType: 'investment-self', dueInDays: 70 },
  { id: 'uebergabe', phase: 3, forPropertyType: 'all', dueInDays: 80 },
  { id: 'ummeldung', phase: 3, forPropertyType: 'ownUse', dueInDays: 95, isCriticalDeadline: true },
  { id: 'versorger', phase: 3, forPropertyType: 'ownUse', dueInDays: 85 },
  { id: 'afa', phase: 4, forPropertyType: 'investment-self', dueInDays: 180 },
  { id: 'nebenkosten', phase: 4, forPropertyType: 'investment-self', dueInDays: 365 }
];

export function buildMilestonesFor(propertyType: PropertyType): Milestone[] {
  return milestoneCatalog
    .filter(m => m.forPropertyType === 'all' || m.forPropertyType === propertyType)
    .map(m => ({
      id: m.id,
      phase: m.phase,
      forPropertyType: m.forPropertyType,
      dueInDays: m.dueInDays,
      isCriticalDeadline: m.isCriticalDeadline,
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
