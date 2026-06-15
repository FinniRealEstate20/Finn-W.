-- =============================================================================
-- PropAfterCare V1 Initial Schema
-- =============================================================================
-- This migration sets up the production data model for the multi-tenant
-- broker-buyer relationship. Sensitive PII (IBAN, Steuer-ID, phone, birth
-- date) is stored as opaque AES-256-GCM ciphertext in *_enc text columns —
-- the app layer handles encryption/decryption (see src/lib/crypto.ts).
--
-- Row-Level-Security is enforced everywhere. The two boundaries are:
--   - a buyer sees only their own data
--   - a broker sees all rows belonging to their org_id
-- Cross-tenant reads/writes return zero rows; service-role bypasses RLS
-- and is used only for cron jobs and webhook handlers.
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type plan_tier as enum ('starter', 'pro', 'business');
create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'inactive'
);
create type milestone_status as enum ('pending', 'in_progress', 'done', 'skipped');
create type submission_status as enum ('draft', 'submitted', 'confirmed', 'failed');
create type property_type_kind as enum (
  'ownUse', 'investment-self', 'investment-managed'
);

-- -----------------------------------------------------------------------------
-- orgs (Maklerbetrieb / tenant root)
-- -----------------------------------------------------------------------------

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_tier plan_tier,
  plan_status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orgs_owner_idx on public.orgs(owner_user_id);
create index orgs_stripe_customer_idx on public.orgs(stripe_customer_id);

-- -----------------------------------------------------------------------------
-- broker_profiles (one row per Makler-User)
-- -----------------------------------------------------------------------------

create table public.broker_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  full_name text not null,
  company text,
  phone text,
  photo_url text,
  brand_color text,
  google_review_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index broker_profiles_org_idx on public.broker_profiles(org_id);

-- -----------------------------------------------------------------------------
-- invitations (Makler-Codes für Käufer-Self-Signup)
-- -----------------------------------------------------------------------------

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  code text not null unique,
  label text,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index invitations_org_idx on public.invitations(org_id);
create index invitations_code_lower_idx on public.invitations(lower(code));

-- -----------------------------------------------------------------------------
-- buyer_profiles (Käufer-Daten, PII verschlüsselt)
-- -----------------------------------------------------------------------------

create table public.buyer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  invitation_id uuid references public.invitations(id),
  full_name text not null,
  email citext not null,
  phone_enc text,
  birth_date_enc text,
  steuer_id_enc text,
  iban_enc text,
  address_old jsonb not null default '{}'::jsonb,
  address_new jsonb not null default '{}'::jsonb,
  move_in_date date,
  property_type property_type_kind,
  meter_electricity text,
  meter_gas text,
  onboarded_at timestamptz,
  profile_completeness int not null default 0,
  key_version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index buyer_profiles_org_idx on public.buyer_profiles(org_id);
create index buyer_profiles_email_idx on public.buyer_profiles(email);

-- -----------------------------------------------------------------------------
-- buyer_milestones (Onboarding-Schritte pro Käufer)
-- -----------------------------------------------------------------------------

create table public.buyer_milestones (
  buyer_id uuid not null references public.buyer_profiles(user_id) on delete cascade,
  milestone_key text not null,
  status milestone_status not null default 'pending',
  completed_at timestamptz,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (buyer_id, milestone_key)
);

-- -----------------------------------------------------------------------------
-- submissions (Formular-Submissions je Käufer)
-- -----------------------------------------------------------------------------

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyer_profiles(user_id) on delete cascade,
  doc_id text not null,
  status submission_status not null default 'draft',
  client_receipt_id text,
  server_receipt_id text,
  fill_summary jsonb not null default '{}'::jsonb,
  pdf_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_buyer_idx on public.submissions(buyer_id);
create index submissions_doc_idx on public.submissions(doc_id);
create index submissions_status_idx on public.submissions(status);

-- -----------------------------------------------------------------------------
-- fill_audit_entries (Audit-Trail je Submission)
-- -----------------------------------------------------------------------------

create table public.fill_audit_entries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  label text not null,
  profile_key text not null,
  value_redacted text,
  selector text,
  source text,
  created_at timestamptz not null default now()
);

create index fill_audit_submission_idx on public.fill_audit_entries(submission_id);

-- -----------------------------------------------------------------------------
-- recipe_proposals (AI Smart-Fill Curator Backlog)
-- -----------------------------------------------------------------------------

create table public.recipe_proposals (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.buyer_profiles(user_id) on delete set null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  host text not null,
  doc_id text,
  proposal jsonb not null,
  status text not null default 'pending',
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index recipe_proposals_org_idx on public.recipe_proposals(org_id);
create index recipe_proposals_status_idx on public.recipe_proposals(status);

-- -----------------------------------------------------------------------------
-- data_export_requests (DSGVO Art. 20)
-- -----------------------------------------------------------------------------

create table public.data_export_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  file_storage_path text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index data_export_user_idx on public.data_export_requests(user_id);
create index data_export_status_idx on public.data_export_requests(status);

-- -----------------------------------------------------------------------------
-- data_delete_requests (DSGVO Art. 17, 14-Tage-Frist)
-- -----------------------------------------------------------------------------

create table public.data_delete_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz not null default (now() + interval '14 days'),
  completed_at timestamptz,
  canceled_at timestamptz
);

create index data_delete_user_idx on public.data_delete_requests(user_id);
create index data_delete_scheduled_idx on public.data_delete_requests(scheduled_for);

-- -----------------------------------------------------------------------------
-- rate_limits (in-Postgres rate limiter; service-role only)
-- -----------------------------------------------------------------------------

create table public.rate_limits (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);

-- =============================================================================
-- Triggers
-- =============================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger orgs_touch before update on public.orgs
  for each row execute function public.touch_updated_at();
create trigger broker_profiles_touch before update on public.broker_profiles
  for each row execute function public.touch_updated_at();
create trigger buyer_profiles_touch before update on public.buyer_profiles
  for each row execute function public.touch_updated_at();
create trigger submissions_touch before update on public.submissions
  for each row execute function public.touch_updated_at();
create trigger buyer_milestones_touch before update on public.buyer_milestones
  for each row execute function public.touch_updated_at();

create or replace function public.bump_invitation_use()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.invitation_id is not null then
    update public.invitations
      set used_count = used_count + 1
      where id = new.invitation_id;
  end if;
  return new;
end $$;

create trigger buyer_profile_uses_invitation
  after insert on public.buyer_profiles
  for each row execute function public.bump_invitation_use();

-- =============================================================================
-- Role helpers (security definer; safe because they only read auth.uid())
-- =============================================================================

create or replace function public.current_broker_org()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.broker_profiles where user_id = auth.uid()
$$;

create or replace function public.current_buyer_org()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.buyer_profiles where user_id = auth.uid()
$$;

-- Public RPC: validate an invitation code without exposing the table.
-- Returns one row with org_id + validity flag, or zero rows if code unknown.
create or replace function public.validate_invitation(code_input text)
returns table(invitation_id uuid, org_id uuid, valid boolean)
language sql stable security definer set search_path = public as $$
  select
    i.id,
    i.org_id,
    (i.max_uses is null or i.used_count < i.max_uses)
      and (i.expires_at is null or i.expires_at > now()) as valid
  from public.invitations i
  where lower(i.code) = lower(code_input)
$$;

grant execute on function public.validate_invitation(text) to anon, authenticated;

-- =============================================================================
-- Row-Level Security
-- =============================================================================

alter table public.orgs                 enable row level security;
alter table public.broker_profiles      enable row level security;
alter table public.invitations          enable row level security;
alter table public.buyer_profiles       enable row level security;
alter table public.buyer_milestones     enable row level security;
alter table public.submissions          enable row level security;
alter table public.fill_audit_entries   enable row level security;
alter table public.recipe_proposals     enable row level security;
alter table public.data_export_requests enable row level security;
alter table public.data_delete_requests enable row level security;
alter table public.rate_limits          enable row level security;

-- orgs ------------------------------------------------------------------------
create policy "owner reads org" on public.orgs for select
  using (owner_user_id = auth.uid());
create policy "owner updates org" on public.orgs for update
  using (owner_user_id = auth.uid());
create policy "user creates own org" on public.orgs for insert
  with check (owner_user_id = auth.uid());

-- broker_profiles -------------------------------------------------------------
create policy "broker reads self" on public.broker_profiles for select
  using (user_id = auth.uid());
create policy "broker updates self" on public.broker_profiles for update
  using (user_id = auth.uid());
create policy "user creates own broker_profile" on public.broker_profiles for insert
  with check (user_id = auth.uid());

-- invitations -----------------------------------------------------------------
create policy "broker reads org invitations" on public.invitations for select
  using (org_id = public.current_broker_org());
create policy "broker writes org invitations" on public.invitations for insert
  with check (org_id = public.current_broker_org() and created_by = auth.uid());
create policy "broker deletes org invitations" on public.invitations for delete
  using (org_id = public.current_broker_org());

-- buyer_profiles --------------------------------------------------------------
create policy "buyer reads self profile" on public.buyer_profiles for select
  using (user_id = auth.uid());
create policy "buyer updates self profile" on public.buyer_profiles for update
  using (user_id = auth.uid());
create policy "broker reads org buyer profiles" on public.buyer_profiles for select
  using (org_id = public.current_broker_org());
create policy "broker updates org buyer profiles" on public.buyer_profiles for update
  using (org_id = public.current_broker_org());
create policy "user creates own buyer_profile" on public.buyer_profiles for insert
  with check (
    user_id = auth.uid()
    and invitation_id is not null
    and exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.org_id = buyer_profiles.org_id
        and (i.max_uses is null or i.used_count < i.max_uses)
        and (i.expires_at is null or i.expires_at > now())
    )
  );

-- buyer_milestones ------------------------------------------------------------
create policy "milestone read for owner or org broker" on public.buyer_milestones for select
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.buyer_profiles bp
      where bp.user_id = buyer_id
        and bp.org_id = public.current_broker_org()
    )
  );
create policy "milestone insert for owner" on public.buyer_milestones for insert
  with check (buyer_id = auth.uid());
create policy "milestone update for owner" on public.buyer_milestones for update
  using (buyer_id = auth.uid());

-- submissions -----------------------------------------------------------------
create policy "submission read for owner or org broker" on public.submissions for select
  using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.buyer_profiles bp
      where bp.user_id = buyer_id
        and bp.org_id = public.current_broker_org()
    )
  );
create policy "submission insert for owner" on public.submissions for insert
  with check (buyer_id = auth.uid());
create policy "submission update for owner" on public.submissions for update
  using (buyer_id = auth.uid());

-- fill_audit_entries ----------------------------------------------------------
create policy "audit read for owner or org broker" on public.fill_audit_entries for select
  using (
    exists (
      select 1 from public.submissions s
      join public.buyer_profiles bp on bp.user_id = s.buyer_id
      where s.id = submission_id
        and (s.buyer_id = auth.uid() or bp.org_id = public.current_broker_org())
    )
  );
create policy "audit insert for submission owner" on public.fill_audit_entries for insert
  with check (
    exists (
      select 1 from public.submissions s
      where s.id = submission_id and s.buyer_id = auth.uid()
    )
  );

-- recipe_proposals ------------------------------------------------------------
create policy "broker reads org proposals" on public.recipe_proposals for select
  using (org_id = public.current_broker_org());
create policy "broker manages org proposals" on public.recipe_proposals for update
  using (org_id = public.current_broker_org());
create policy "buyer reads own proposals" on public.recipe_proposals for select
  using (buyer_id = auth.uid());
create policy "buyer writes own proposal" on public.recipe_proposals for insert
  with check (buyer_id = auth.uid() and org_id = public.current_buyer_org());

-- data_export_requests --------------------------------------------------------
create policy "user reads own exports" on public.data_export_requests for select
  using (user_id = auth.uid());
create policy "user creates own export" on public.data_export_requests for insert
  with check (user_id = auth.uid());

-- data_delete_requests --------------------------------------------------------
create policy "user reads own delete-reqs" on public.data_delete_requests for select
  using (user_id = auth.uid());
create policy "user creates own delete-req" on public.data_delete_requests for insert
  with check (user_id = auth.uid());
create policy "user cancels own delete-req" on public.data_delete_requests for update
  using (user_id = auth.uid() and completed_at is null);

-- rate_limits ----------------------------------------------------------------
-- No policies: only service-role accesses this table.
