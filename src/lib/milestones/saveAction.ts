'use server';

import { getSession } from '@/lib/auth/getUser';
import { setMilestoneStatus } from '@/lib/data/milestones';
import type { MilestoneStatus } from '@/types';

const ALLOWED: MilestoneStatus[] = ['open', 'in_progress', 'done'];

export async function saveMilestoneAction(
  milestoneKey: string,
  status: MilestoneStatus
): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session || session.role !== 'buyer') return { ok: false };
  if (!ALLOWED.includes(status)) return { ok: false };
  const ok = await setMilestoneStatus(session.userId, milestoneKey, status);
  return { ok };
}
