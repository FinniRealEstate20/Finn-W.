-- =============================================================================
-- 0003 — invitations: optional recipient email + send-state tracking
-- =============================================================================
-- Adds the columns needed to dispatch invitation codes by email through
-- Resend instead of relying on the broker to copy the link. Backwards
-- compatible: all columns nullable, so existing rows + the copy-link flow
-- keep working.
--
--   email             — recipient address the code was originally meant for
--   sent_at           — timestamp of the last successful Resend dispatch
--   send_count        — number of successful dispatches (for "resend" UI)
--   last_send_error   — error string from the most recent failed attempt
-- =============================================================================

alter table public.invitations
  add column if not exists email           citext,
  add column if not exists sent_at         timestamptz,
  add column if not exists send_count      int not null default 0,
  add column if not exists last_send_error text;

create index if not exists invitations_email_idx on public.invitations(email);
