import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CHAT_SYSTEM_PROMPT, findDemoAnswer } from '@/lib/chatSystem';

export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  propertyType?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequest | null;

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const latestUserMsg = [...body.messages].reverse().find(m => m.role === 'user')?.content ?? '';

  if (!apiKey) {
    return NextResponse.json({
      content: findDemoAnswer(latestUserMsg),
      mode: 'demo'
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const systemWithContext = body.propertyType
      ? `${CHAT_SYSTEM_PROMPT}\n\nAktuelles Käuferprofil: ${body.propertyType}`
      : CHAT_SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemWithContext,
      messages: body.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block.type === 'text' ? block.text : ''))
      .join('\n');

    return NextResponse.json({
      content: text || findDemoAnswer(latestUserMsg),
      mode: 'live'
    });
  } catch (err) {
    console.error('Anthropic API error:', err);
    return NextResponse.json({
      content: findDemoAnswer(latestUserMsg),
      mode: 'fallback'
    });
  }
}
