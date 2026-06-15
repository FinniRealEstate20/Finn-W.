import { decryptPII } from '@/lib/crypto';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

interface BuyerExport {
  profile: Record<string, unknown>;
  milestones: unknown[];
  submissions: unknown[];
  fill_audits: unknown[];
}

interface BrokerExport {
  profile: Record<string, unknown>;
  org: Record<string, unknown> | null;
  invitations: unknown[];
}

export interface UserExport {
  generatedAt: string;
  userId: string;
  email: string;
  role: 'broker' | 'buyer' | 'none';
  buyer: BuyerExport | null;
  broker: BrokerExport | null;
}

/**
 * Build a portable JSON blob with everything we have about this user.
 * Uses the service role so the cron path can also call it; pages that
 * call it must first verify session ownership.
 */
export async function buildUserExport(
  userId: string,
  email: string
): Promise<UserExport> {
  const service = createSupabaseServiceClient();

  const [{ data: brokerRow }, { data: buyerRow }] = await Promise.all([
    service
      .from('broker_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    service
      .from('buyer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  let buyer: BuyerExport | null = null;
  if (buyerRow) {
    const [{ data: milestones }, { data: submissions }] = await Promise.all([
      service.from('buyer_milestones').select('*').eq('buyer_id', userId),
      service.from('submissions').select('*').eq('buyer_id', userId),
    ]);
    const submissionIds = (submissions ?? []).map((s: { id: string }) => s.id);
    const { data: audits } =
      submissionIds.length > 0
        ? await service
            .from('fill_audit_entries')
            .select('*')
            .in('submission_id', submissionIds)
        : { data: [] };

    buyer = {
      profile: decryptBuyerRow(buyerRow as Record<string, unknown>),
      milestones: milestones ?? [],
      submissions: submissions ?? [],
      fill_audits: audits ?? [],
    };
  }

  let broker: BrokerExport | null = null;
  if (brokerRow) {
    const orgId = (brokerRow as { org_id: string }).org_id;
    const [{ data: org }, { data: invitations }] = await Promise.all([
      service.from('orgs').select('*').eq('id', orgId).maybeSingle(),
      service.from('invitations').select('*').eq('org_id', orgId),
    ]);
    broker = {
      profile: brokerRow as Record<string, unknown>,
      org: (org ?? null) as Record<string, unknown> | null,
      invitations: invitations ?? [],
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    userId,
    email,
    role: brokerRow ? 'broker' : buyerRow ? 'buyer' : 'none',
    buyer,
    broker,
  };
}

function decryptBuyerRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const key of ['phone_enc', 'birth_date_enc', 'steuer_id_enc', 'iban_enc'] as const) {
    const enc = row[key];
    if (typeof enc === 'string') {
      try {
        out[key.replace(/_enc$/, '')] = decryptPII(enc);
      } catch {
        out[key.replace(/_enc$/, '')] = null;
      }
      delete out[key];
    }
  }
  return out;
}
