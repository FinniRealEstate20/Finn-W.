import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyRecipeToken } from '@/lib/recipeToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SNIPPET_BYTES = 8 * 1024;
const MAX_LABEL_LEN = 60;
const MAX_SELECTORS = 8;
const RATE_LIMIT_PER_MIN = 5;

const SYSTEM_PROMPT = `Du bist ein DOM-Mapping-Helfer. Du bekommst ein HTML-Snippet eines deutschen Behörden- oder Versorger-Portals und sollst den CSS-Selektor zurückgeben, der das Eingabefeld für ein bestimmtes Profil-Feld eindeutig identifiziert.

Regeln:
- Antworte AUSSCHLIESSLICH mit einem einzigen CSS-Selektor (maximal 120 Zeichen), nichts sonst. Kein Markdown, keine Erklärung, kein Code-Fence.
- Bevorzuge stabile Selektoren in dieser Reihenfolge: id > name-Attribut > data-attribute > aria-label > Klasse.
- Wenn kein passendes Eingabefeld erkennbar ist, antworte exakt mit: null
- Greife NIEMALS auf Submit-Buttons, Links, Formular-Container oder andere Nicht-Input-Elemente zu.
- Du siehst nur DOM-Struktur, keine Profildaten. Du musst keine Werte vorschlagen.`;

interface RateBucket {
  count: number;
  resetAt: number;
}

function getRateStore(): Map<string, RateBucket> {
  const g = globalThis as unknown as { __pacMapperRate?: Map<string, RateBucket> };
  if (!g.__pacMapperRate) g.__pacMapperRate = new Map();
  return g.__pacMapperRate;
}

function checkRateLimit(buyerId: string): boolean {
  const store = getRateStore();
  const now = Date.now();
  const bucket = store.get(buyerId);
  if (!bucket || bucket.resetAt < now) {
    store.set(buyerId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_PER_MIN) return false;
  bucket.count += 1;
  return true;
}

interface RecipeProposal {
  proposedAt: string;
  buyerId: string;
  docId: string;
  profileKey: string;
  label: string;
  selector: string;
  attemptedSelectors: string[];
}

function recordProposal(proposal: RecipeProposal) {
  const g = globalThis as unknown as { __pacRecipeProposals?: RecipeProposal[] };
  if (!g.__pacRecipeProposals) g.__pacRecipeProposals = [];
  g.__pacRecipeProposals.unshift(proposal);
  if (g.__pacRecipeProposals.length > 200) g.__pacRecipeProposals.length = 200;
}

interface MapperBody {
  token?: string;
  docId?: string;
  profileKey?: string;
  label?: string;
  htmlSnippet?: string;
  attemptedSelectors?: string[];
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as MapperBody | null;
  if (!body) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const payload = verifyRecipeToken(body.token ?? '');
  if (!payload) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  if (!checkRateLimit(payload.buyerId)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const snippet = typeof body.htmlSnippet === 'string' ? body.htmlSnippet : '';
  if (!snippet) {
    return NextResponse.json({ error: 'missing_snippet' }, { status: 400 });
  }
  if (Buffer.byteLength(snippet, 'utf8') > MAX_SNIPPET_BYTES) {
    return NextResponse.json({ error: 'snippet_too_large' }, { status: 422 });
  }

  const docId = (body.docId ?? '').slice(0, 64);
  const profileKey = (body.profileKey ?? '').slice(0, 64);
  const label = (body.label ?? '').slice(0, MAX_LABEL_LEN);
  if (!docId || !profileKey || !label) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const attemptedSelectors = (body.attemptedSelectors ?? [])
    .filter((s): s is string => typeof s === 'string')
    .slice(0, MAX_SELECTORS)
    .map(s => s.slice(0, 200));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'mapper_unavailable' }, { status: 503 });
  }

  try {
    const client = new Anthropic({ apiKey });
    const userPrompt = `Profilfeld gesucht: ${label} (Schlüssel: ${profileKey})
Bereits erfolglos probiert: ${attemptedSelectors.length ? attemptedSelectors.join(', ') : 'keine'}

HTML-Snippet:
\`\`\`html
${snippet}
\`\`\`

Antworte ausschließlich mit dem CSS-Selektor oder mit "null".`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();

    if (!text || text.toLowerCase() === 'null') {
      return NextResponse.json({ selector: null, mode: 'live' });
    }

    const selector = text
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/```$/, '')
      .trim()
      .slice(0, 200);

    recordProposal({
      proposedAt: new Date().toISOString(),
      buyerId: payload.buyerId,
      docId,
      profileKey,
      label,
      selector,
      attemptedSelectors
    });

    return NextResponse.json({ selector, mode: 'live' });
  } catch (err) {
    console.error('Portal-mapper error:', err);
    return NextResponse.json({ error: 'mapper_failed' }, { status: 502 });
  }
}

export function GET() {
  const g = globalThis as unknown as { __pacRecipeProposals?: RecipeProposal[] };
  return NextResponse.json({ proposals: (g.__pacRecipeProposals ?? []).slice(0, 50) });
}
