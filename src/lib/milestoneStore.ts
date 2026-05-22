'use client';

import type { MilestoneStatus } from '@/types';

const STORAGE_KEY = 'pac:milestones:v1';

interface StoredState {
  [buyerId: string]: {
    [milestoneId: string]: MilestoneStatus;
  };
}

function read(): StoredState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredState) : {};
  } catch {
    return {};
  }
}

function write(state: StoredState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota or disabled — ignore silently
  }
}

export function loadStatuses(buyerId: string): Record<string, MilestoneStatus> {
  return read()[buyerId] ?? {};
}

export function saveStatus(
  buyerId: string,
  milestoneId: string,
  status: MilestoneStatus
) {
  const state = read();
  if (!state[buyerId]) state[buyerId] = {};
  state[buyerId][milestoneId] = status;
  write(state);
}

export function resetBuyer(buyerId: string) {
  const state = read();
  delete state[buyerId];
  write(state);
}
