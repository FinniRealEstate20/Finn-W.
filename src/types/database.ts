// Stub. The hand-typed shape was incomplete enough to cause more friction
// than it removed — supabase-js infers as `any` for table rows in V1, and
// we re-introduce strict typing in CI once `supabase gen types typescript
// --linked > src/types/database.ts` is wired up.
//
// Until then, callers can cast individual query results with
// `.maybeSingle<{ org_id: string }>()` etc. for the few hot paths that
// benefit from typed rows (see src/lib/auth/getUser.ts for an example).
export type Database = unknown;
