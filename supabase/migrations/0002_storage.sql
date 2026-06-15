-- =============================================================================
-- Storage buckets for V1
-- =============================================================================
-- submission-pdfs : signed PDF of each completed submission, path is
--                   "<buyer_user_id>/<submission_id>.pdf"
-- data-exports    : DSGVO ZIP exports, path is
--                   "<user_id>/<export_id>.zip"
-- =============================================================================

insert into storage.buckets (id, name, public)
  values ('submission-pdfs', 'submission-pdfs', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('data-exports', 'data-exports', false)
  on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- submission-pdfs policies
-- -----------------------------------------------------------------------------

create policy "buyer reads own submission pdf"
  on storage.objects for select
  using (
    bucket_id = 'submission-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "broker reads org submission pdf"
  on storage.objects for select
  using (
    bucket_id = 'submission-pdfs'
    and exists (
      select 1 from public.buyer_profiles bp
      where bp.user_id::text = (storage.foldername(name))[1]
        and bp.org_id = public.current_broker_org()
    )
  );

create policy "buyer uploads own submission pdf"
  on storage.objects for insert
  with check (
    bucket_id = 'submission-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "buyer deletes own submission pdf"
  on storage.objects for delete
  using (
    bucket_id = 'submission-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- data-exports policies (DSGVO Art. 20 download link)
-- -----------------------------------------------------------------------------

create policy "user reads own data export"
  on storage.objects for select
  using (
    bucket_id = 'data-exports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT for data-exports is service-role only (cron job builds the ZIP).
