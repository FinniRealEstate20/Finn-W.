'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteInvitation, resendInvitationEmail } from '@/lib/auth/invitations';

interface Invitation {
  id: string;
  code: string;
  label: string | null;
  email: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
  sent_at: string | null;
  send_count: number;
  last_send_error: string | null;
}

function statusOf(inv: Invitation): 'used' | 'open' | 'expired' {
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) return 'expired';
  if (inv.max_uses != null && inv.used_count >= inv.max_uses) return 'used';
  return 'open';
}

export function InvitationRow({
  invitation,
  locale,
  appUrl,
}: {
  invitation: Invitation;
  locale: string;
  appUrl: string;
}) {
  const t = useTranslations('broker.invitations.row');
  const [pending, startTransition] = useTransition();
  const [sendPending, startSendTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [override, setOverride] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const status = statusOf(invitation);
  const link = `${appUrl}/${locale}/signup/buyer?code=${invitation.code}`;
  const canSend = status === 'open' && (invitation.email || showOverride);

  function handleDelete() {
    if (!confirm(t('confirmDelete'))) return;
    const fd = new FormData();
    fd.set('id', invitation.id);
    fd.set('locale', locale);
    startTransition(() => {
      void deleteInvitation(fd);
    });
  }

  function handleSend() {
    if (!invitation.email && !override.trim()) {
      setShowOverride(true);
      return;
    }
    setFeedback(null);
    const fd = new FormData();
    fd.set('id', invitation.id);
    fd.set('locale', locale);
    if (override.trim()) fd.set('email', override.trim());
    startSendTransition(async () => {
      const r = await resendInvitationEmail(fd);
      setFeedback({ ok: r.ok, message: r.message });
      if (r.ok) {
        setOverride('');
        setShowOverride(false);
      }
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-ink">
              {invitation.code}
            </span>
            <StatusChip status={status} />
          </div>
          <div className="text-xs text-ink-muted">
            {invitation.label || t('noLabel')} ·{' '}
            {new Date(invitation.created_at).toLocaleDateString(locale)}
          </div>
          {invitation.sent_at && (
            <div className="mt-0.5 text-xs text-emerald-700">
              {t('sentTo', { email: invitation.email ?? '' })} ·{' '}
              {t('sentAt', {
                date: new Date(invitation.sent_at).toLocaleDateString(locale),
              })}
              {invitation.send_count > 1 && (
                <> · {t('sendCount', { count: invitation.send_count })}</>
              )}
            </div>
          )}
          {invitation.last_send_error && !invitation.sent_at && (
            <div className="mt-0.5 text-xs text-rose-600">
              {t('lastError', { error: invitation.last_send_error })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === 'open' && (
            <button
              type="button"
              onClick={copy}
              className="btn-secondary py-1.5 text-xs"
            >
              {copied ? t('copied') : t('copyLink')}
            </button>
          )}
          {status === 'open' && (
            <button
              type="button"
              onClick={handleSend}
              className="btn-secondary py-1.5 text-xs"
              disabled={sendPending}
            >
              {sendPending
                ? t('sending')
                : invitation.sent_at
                  ? t('resendEmail')
                  : t('sendEmail')}
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs text-rose-600 hover:underline disabled:opacity-50"
            disabled={pending}
          >
            {pending ? t('deleting') : t('delete')}
          </button>
        </div>
      </div>
      {showOverride && status === 'open' && (
        <div className="mt-2 flex items-center gap-2 pl-1">
          <input
            type="email"
            value={override}
            onChange={e => setOverride(e.target.value)}
            className="input flex-1 text-xs"
            placeholder={t('overrideEmailPlaceholder')}
            aria-label={t('overrideEmailLabel')}
            disabled={sendPending}
          />
          <button
            type="button"
            onClick={handleSend}
            className="btn-primary py-1.5 text-xs"
            disabled={sendPending || !override.trim()}
          >
            {sendPending ? t('sending') : t('sendEmail')}
          </button>
        </div>
      )}
      {feedback && (
        <div
          className={`mt-2 rounded-md px-2 py-1 text-xs ${
            feedback.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.message}
        </div>
      )}
      {canSend && !invitation.email && !showOverride && (
        <div className="mt-1 text-xs text-ink-muted">{t('overrideEmailLabel')}</div>
      )}
    </li>
  );
}

function StatusChip({ status }: { status: 'used' | 'open' | 'expired' }) {
  const t = useTranslations('broker.invitations.status');
  const styles: Record<typeof status, string> = {
    open: 'bg-emerald-50 text-emerald-700',
    used: 'bg-slate-100 text-slate-600',
    expired: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>
      {t(status)}
    </span>
  );
}
