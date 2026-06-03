'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangleIcon, InfoIcon } from './icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function renderContent(content: string) {
  return content.split('\n\n').map((paragraph, pi) => (
    <p key={pi} className={pi > 0 ? 'mt-3' : ''}>
      {paragraph.split('\n').map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {renderInline(line)}
        </span>
      ))}
    </p>
  ));
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function ChatInterface({ propertyType }: { propertyType?: string }) {
  const t = useTranslations('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hallo! Was beschäftigt dich gerade rund um deinen neuen Wohnsitz?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'demo' | 'live' | 'fallback' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggested = t.raw('suggested') as string[];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const userMsg: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, propertyType })
      });
      const data = (await res.json()) as { content: string; mode?: 'demo' | 'live' | 'fallback' };
      setMessages([...nextMessages, { role: 'assistant', content: data.content }]);
      if (data.mode) setMode(data.mode);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            'Da ist etwas schiefgelaufen. Bitte versuche es gleich nochmal – oder frag deinen Makler.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    void send(trimmed);
  }

  return (
    <>
      <div className="card flex flex-col">
        <div ref={scrollRef} className="max-h-[480px] space-y-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  KI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === 'user'
                    ? 'rounded-tr-sm bg-brand-600 text-white'
                    : 'rounded-tl-sm bg-slate-100 text-ink'
                }`}
              >
                {renderContent(m.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                KI
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-ink-soft">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-muted" />
                </span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggested.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void send(q)}
                disabled={loading}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-ink-soft transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          className="input flex-1"
          placeholder={t('placeholder')}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
          {t('send')}
        </button>
      </form>

      {mode === 'demo' && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-100 px-4 py-2 text-[11px] text-ink-muted">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Demo-Modus: vorbereitete Antworten zu typischen Fragen. Für volle KI:
            <code className="mx-1 rounded bg-white px-1 py-0.5 font-mono">ANTHROPIC_API_KEY</code>
            in <code className="rounded bg-white px-1 py-0.5 font-mono">.env.local</code> setzen.
          </span>
        </p>
      )}

      {mode === 'fallback' && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-2 text-[11px] text-amber-900">
          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>Verbindung zur KI gerade nicht möglich – Fallback-Antwort wird gezeigt.</span>
        </p>
      )}
    </>
  );
}
