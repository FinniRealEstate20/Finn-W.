import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/documents';
import type { FormEntry } from '@/types';

const SOURCE_BADGE_STYLES: Record<FormEntry['sourceType'], string> = {
  inhouse: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  external_link: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  communal_pdf: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
};

const SOURCE_ICONS: Record<FormEntry['sourceType'], string> = {
  inhouse: '📝',
  external_link: '🔗',
  communal_pdf: '🏛️'
};

export function DocumentItem({
  form,
  locale
}: {
  form: FormEntry;
  locale: string;
}) {
  const t = useTranslations('documents');

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg">
          {SOURCE_ICONS[form.sourceType]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{t(`items.${form.id}.name`)}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', SOURCE_BADGE_STYLES[form.sourceType])}>
              {t(`sourceType.${form.sourceType}`)}
            </span>
            {form.status === 'under_review' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-100">
                🔍 {t('underReview')}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">{t(`items.${form.id}.hint`)}</p>
          <p className="mt-1 text-[11px] text-ink-muted">
            {t('sourceLine', {
              source: form.officialSource.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
              date: formatDate(form.lastCheckedAt)
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex gap-3 text-[11px] text-ink-muted">
          {form.estimatedTimeMin && <span>⏱ {form.estimatedTimeMin} Min</span>}
          {form.estimatedCost && <span>💶 {form.estimatedCost}</span>}
        </div>
        <Link href={`/${locale}/documents/${form.id}`} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
          {t('actions.open')} →
        </Link>
      </div>
    </article>
  );
}
