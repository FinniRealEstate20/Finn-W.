'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/documents';
import { computeDeadline, type DeadlineInfo } from '@/lib/fristen';
import { loadProfile } from '@/lib/profileStore';
import { getSubmission, type SubmissionStatus } from '@/lib/submissionStore';
import type { FormEntry } from '@/types';
import { DeadlineBadge } from './DeadlineBadge';
import {
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LandmarkIcon,
  SearchIcon
} from './icons';

const SOURCE_BADGE_STYLES: Record<FormEntry['sourceType'], string> = {
  inhouse: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  external_link: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  communal_pdf: 'bg-amber-50 text-amber-800 ring-1 ring-amber-100',
  info_only: 'bg-slate-100 text-ink-soft ring-1 ring-slate-200',
  generator: 'bg-brand-50 text-brand-800 ring-1 ring-brand-100'
};

const SOURCE_ICON_STYLES: Record<FormEntry['sourceType'], string> = {
  inhouse: 'bg-emerald-50 text-emerald-700',
  external_link: 'bg-sky-50 text-sky-700',
  communal_pdf: 'bg-amber-50 text-amber-800',
  info_only: 'bg-slate-100 text-ink-soft',
  generator: 'bg-brand-50 text-brand-800'
};

function SourceIcon({ type, className }: { type: FormEntry['sourceType']; className?: string }) {
  if (type === 'inhouse' || type === 'generator') return <FileTextIcon className={className} />;
  if (type === 'external_link') return <ExternalLinkIcon className={className} />;
  return <LandmarkIcon className={className} />;
}

const STATUS_BADGE: Record<SubmissionStatus, { label: string; cls: string; withCheck?: boolean }> = {
  draft: { label: 'Entwurf', cls: 'bg-slate-100 text-ink-soft ring-slate-200' },
  submitted: { label: 'Eingereicht', cls: 'bg-sky-50 text-sky-700 ring-sky-100' },
  confirmed: { label: 'Erledigt', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100', withCheck: true },
  failed: { label: 'Fehlgeschlagen', cls: 'bg-red-50 text-red-700 ring-red-100' }
};

export function DocumentItem({
  form,
  locale
}: {
  form: FormEntry;
  locale: string;
}) {
  const t = useTranslations('documents');
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [deadline, setDeadline] = useState<DeadlineInfo | null>(null);

  useEffect(() => {
    setStatus(getSubmission(form.id)?.status ?? null);
    if (form.hub?.deadline) {
      const p = loadProfile();
      setDeadline(computeDeadline(form.hub.deadline, p));
    }
  }, [form.id, form.hub?.deadline]);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg', SOURCE_ICON_STYLES[form.sourceType])}>
          <SourceIcon type={form.sourceType} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{t(`items.${form.id}.name`)}</h3>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', SOURCE_BADGE_STYLES[form.sourceType])}>
              {t(`sourceType.${form.sourceType}`)}
            </span>
            {form.status === 'under_review' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-100">
                <SearchIcon className="h-3 w-3" />
                {t('underReview')}
              </span>
            )}
            {status && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1',
                  STATUS_BADGE[status].cls
                )}
              >
                {STATUS_BADGE[status].withCheck && <CheckIcon className="h-3 w-3" />}
                {STATUS_BADGE[status].label}
              </span>
            )}
            {deadline && status !== 'confirmed' && <DeadlineBadge deadline={deadline} />}
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
          {form.estimatedTimeMin && (
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {form.estimatedTimeMin} Min
            </span>
          )}
          {form.estimatedCost && <span>{form.estimatedCost}</span>}
        </div>
        <Link href={`/${locale}/documents/${form.id}`} className="text-xs font-semibold text-brand-700 hover:text-brand-800">
          {t('actions.open')} →
        </Link>
      </div>
    </article>
  );
}
