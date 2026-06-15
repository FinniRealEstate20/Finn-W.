import { buildMilestonesFor } from '@/lib/milestones';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { Milestone, MilestoneStatus, PropertyType } from '@/types';

type DbStatus = 'pending' | 'in_progress' | 'done' | 'skipped';

function appToDb(status: MilestoneStatus): DbStatus {
  switch (status) {
    case 'open':
      return 'pending';
    case 'in_progress':
      return 'in_progress';
    case 'done':
      return 'done';
  }
}

function dbToApp(status: DbStatus): MilestoneStatus {
  switch (status) {
    case 'pending':
      return 'open';
    case 'in_progress':
      return 'in_progress';
    case 'done':
      return 'done';
    case 'skipped':
      return 'done';
  }
}

/**
 * Seed the buyer's milestone rows on first load. Idempotent: existing
 * rows are left alone so a re-run after a property-type change can add
 * new rows without resetting progress.
 */
export async function ensureMilestonesFor(
  buyerId: string,
  propertyType: PropertyType
): Promise<void> {
  const service = createSupabaseServiceClient();
  const template = buildMilestonesFor(propertyType);

  const { data: existing } = await service
    .from('buyer_milestones')
    .select('milestone_key')
    .eq('buyer_id', buyerId);
  const have = new Set((existing ?? []).map((r: { milestone_key: string }) => r.milestone_key));

  const missing = template
    .filter(m => !have.has(m.id))
    .map(m => ({
      buyer_id: buyerId,
      milestone_key: m.id,
      status: 'pending' as DbStatus,
    }));
  if (missing.length > 0) {
    await service.from('buyer_milestones').insert(missing);
  }
}

/**
 * Read merged milestone state for a buyer: the catalog (built from the
 * buyer's propertyType) overlaid with the persisted statuses.
 */
export async function getMilestonesFor(
  buyerId: string,
  propertyType: PropertyType
): Promise<Milestone[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('buyer_milestones')
    .select('milestone_key, status')
    .eq('buyer_id', buyerId);
  const statusByKey = new Map<string, DbStatus>(
    (data ?? []).map((r: { milestone_key: string; status: DbStatus }) => [
      r.milestone_key,
      r.status,
    ])
  );

  return buildMilestonesFor(propertyType).map(m => ({
    ...m,
    status: dbToApp(statusByKey.get(m.id) ?? 'pending'),
  }));
}

/**
 * Update a single milestone status. Server action helper — pages call
 * this through src/lib/milestones/saveAction.ts so they don't need to
 * import the server client directly.
 */
export async function setMilestoneStatus(
  buyerId: string,
  milestoneKey: string,
  status: MilestoneStatus
): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const dbStatus = appToDb(status);
  const { error } = await supabase
    .from('buyer_milestones')
    .upsert(
      {
        buyer_id: buyerId,
        milestone_key: milestoneKey,
        status: dbStatus,
        completed_at: dbStatus === 'done' ? new Date().toISOString() : null,
      },
      { onConflict: 'buyer_id,milestone_key' }
    );
  return !error;
}
