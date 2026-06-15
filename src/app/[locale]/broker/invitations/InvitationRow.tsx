'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteInvitation } from '@/lib/auth/invitations';

interface Invitation {
  id: string;
  code: string;
  label: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
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
  const [copied, setCopied] = useState(false);
  const status = statusOf(invitation);
  const link = `${appUrl}/${locale}/signup/buyer?code=${invitation.code}`;

  function handleDelete() {
    if (!confirm(t('confirmDelete'))) return;
    const fd = new FormData();
    fd.set('id', invitation.id);
    fd.set('locale', locale);
    startTransition(() => {
      void deleteInvitation(fd);
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
    <li className="flex items-center justify-between gap-4 py-3">
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
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-rose-600 hover:underline disabled:opacity-50"
          disabled={pending}
        >
          {pending ? t('deleting') : t('delete')}
        </button>
      </div>
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
