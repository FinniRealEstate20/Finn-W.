import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import type { DocumentItem as DocumentItemType } from '@/types';

export function DocumentItem({
  doc,
  locale
}: {
  doc: DocumentItemType;
  locale: string;
}) {
  const t = useTranslations('documents');

  return (
    <article className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-card">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6m-6 4h4"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{t(`items.${doc.id}.name`)}</h3>
          {doc.prefillable && (
            <span className={cn('chip', 'bg-emerald-50 text-emerald-700')}>
              {t('prefilled')}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ink-muted">{t(`items.${doc.id}.hint`)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/${locale}/documents/${doc.id}`} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            {t('actions.open')} →
          </Link>
          {doc.externalUrl && (
            <a
              href={doc.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-ink-muted hover:text-ink-soft"
            >
              {t('actions.external')} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
