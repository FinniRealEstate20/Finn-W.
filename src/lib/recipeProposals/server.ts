export type ProposalStatus = 'new' | 'accepted' | 'dismissed';

export interface RecipeProposal {
  id: string;
  proposedAt: string;
  buyerId: string;
  docId: string;
  profileKey: string;
  label: string;
  selector: string;
  attemptedSelectors: string[];
  status: ProposalStatus;
  decidedAt?: string;
}

interface Store {
  list: RecipeProposal[];
}

const MAX_PROPOSALS = 200;

function getStore(): Store {
  const g = globalThis as unknown as { __pacRecipeProposals?: Store };
  if (!g.__pacRecipeProposals) g.__pacRecipeProposals = { list: [] };
  return g.__pacRecipeProposals;
}

function nextId(): string {
  return `prop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordProposal(
  input: Omit<RecipeProposal, 'id' | 'status'>
): RecipeProposal {
  const store = getStore();
  const proposal: RecipeProposal = {
    ...input,
    id: nextId(),
    status: 'new'
  };
  store.list.unshift(proposal);
  if (store.list.length > MAX_PROPOSALS) store.list.length = MAX_PROPOSALS;
  return proposal;
}

export function listProposals(opts?: {
  limit?: number;
  status?: ProposalStatus;
}): RecipeProposal[] {
  const { limit = 50, status } = opts ?? {};
  const list = getStore().list;
  const filtered = status ? list.filter(p => p.status === status) : list;
  return filtered.slice(0, limit);
}

export function setProposalStatus(
  id: string,
  status: ProposalStatus
): RecipeProposal | null {
  const store = getStore();
  const idx = store.list.findIndex(p => p.id === id);
  if (idx < 0) return null;
  store.list[idx] = {
    ...store.list[idx],
    status,
    decidedAt: new Date().toISOString()
  };
  return store.list[idx];
}

export function clearProposals() {
  getStore().list = [];
}

export function countByStatus(): Record<ProposalStatus, number> {
  const list = getStore().list;
  return {
    new: list.filter(p => p.status === 'new').length,
    accepted: list.filter(p => p.status === 'accepted').length,
    dismissed: list.filter(p => p.status === 'dismissed').length
  };
}
