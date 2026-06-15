# Supabase Setup

This folder holds the SQL migrations for the PropAfterCare production database.
Migrations are plain SQL — they apply with the Supabase CLI or, for one-off
hot-fixes, by pasting them into the SQL editor in the Supabase dashboard.

## Project layout

- `migrations/0001_init.sql` — schema, enums, triggers, helper functions, RLS
- `migrations/0002_storage.sql` — `submission-pdfs` + `data-exports` buckets

## First-time setup (local dev)

```bash
npm i -g supabase
supabase init
supabase link --project-ref <your-project-ref>
supabase db push
```

## Recreating the database from scratch (dev only)

```bash
supabase db reset
```

This drops the public schema and re-applies all migrations.

## Adding a new migration

```bash
supabase migration new my_change
# edit supabase/migrations/00xx_my_change.sql
supabase db push
```

## Production deployment

The migrations are applied via the Supabase dashboard's SQL editor or via
`supabase db push` against the production project. Service-role key never
leaves the Vercel server-side env.

## RLS test seeds

Three example users for cross-tenant RLS verification (run after migrations):

```sql
-- Two orgs, two brokers, three buyers (two in org A, one in org B)
-- See tests/rls/seed.sql when the Vitest harness is wired up.
```
