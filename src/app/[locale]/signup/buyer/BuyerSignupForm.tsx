'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { signupBuyer } from '@/lib/auth/invitations';

export function BuyerSignupForm({ locale, code }: { locale: string; code: string }) {
  const t = useTranslations('auth.signupBuyer');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await signupBuyer(formData);
      setFeedback(result);
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="code" value={code} />
      <label className="block">
        <span className="text-sm font-medium text-ink">{t('fullNameLabel')}</span>
        <input
          type="text"
          name="full_name"
          required
          autoComplete="name"
          className="input mt-1 w-full"
          disabled={pending}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">{t('emailLabel')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          className="input mt-1 w-full"
          disabled={pending}
        />
      </label>
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? t('sending') : t('submit')}
      </button>
      {feedback && (
        <div
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            feedback.ok
              ? 'bg-emerald-50 text-emerald-900'
              : 'bg-rose-50 text-rose-900'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </form>
  );
}
