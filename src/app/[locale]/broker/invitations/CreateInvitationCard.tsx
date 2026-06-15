'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { createInvitation, type CreateInvitationResult } from '@/lib/auth/invitations';

export function CreateInvitationCard({
  locale,
  appUrl: _appUrl,
}: {
  locale: string;
  appUrl: string;
}) {
  const t = useTranslations('broker.invitations.create');
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState<CreateInvitationResult | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(formData: FormData) {
    setCopied(false);
    setCreated(null);
    startTransition(async () => {
      const result = await createInvitation(formData);
      setCreated(result);
    });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — fallback would be to focus the readonly input
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-ink">{t('title')}</h2>
      <p className="mt-1 text-sm text-ink-soft">{t('subtitle')}</p>
      <form action={handleSubmit} className="mt-4 space-y-3">
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          <span className="text-sm font-medium text-ink">{t('labelLabel')}</span>
          <input
            type="text"
            name="label"
            className="input mt-1 w-full"
            placeholder={t('labelPlaceholder')}
            disabled={pending}
          />
        </label>
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? t('sending') : t('submit')}
        </button>
      </form>

      {created?.ok && created.code && created.link && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {t('successHeading')}
          </div>
          <div className="mt-1 font-mono text-lg text-emerald-900">{created.code}</div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={created.link}
              className="input flex-1 truncate font-mono text-xs"
              onFocus={e => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={() => copy(created.link!)}
              className="btn-secondary py-2 text-xs"
            >
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <p className="mt-2 text-xs text-emerald-800">{t('shareHint')}</p>
        </div>
      )}
      {created && !created.ok && (
        <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {created.message}
        </div>
      )}
    </div>
  );
}
