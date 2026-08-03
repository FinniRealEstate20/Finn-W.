-- =============================================================================
-- Drop autofill / smart-fill / bookmarklet machinery
-- =============================================================================
-- The smart-fill approach (browser bookmarklet + DOM-injection recipes + AI
-- selector proposals) turned out too fragile in practice. The demo now relies
-- purely on external deep-links: buyer clicks a button, lands on the official
-- portal, fills it in there. See src/lib/documents.ts.
--
-- This migration drops the two tables + their RLS policies that were only
-- used by the autofill flow. The core `submissions` table stays untouched.
-- =============================================================================

-- Drop policies first (or rely on CASCADE via DROP TABLE)
drop table if exists public.fill_audit_entries cascade;
drop table if exists public.recipe_proposals   cascade;
