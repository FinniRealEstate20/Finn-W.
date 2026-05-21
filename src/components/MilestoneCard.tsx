import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import type { Milestone } from '@/types';

const STATUS_STYLES: Record<Milestone['status'], { dot: string; label: string }> = {
  open: { dot: 'bg-slate-300', label: 'Offen' },
  in_progress: { dot: 'bg-amber-400', label: 'In Arbeit' },
  done: { dot: 'bg-emerald-500', label: 'Erledigt' }
};

export function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const t = useTranslations('milestones');
  const style = STATUS_STYLES[milestone.status];
  const isDone = milestone.status === 'done';

  return (
    <article
      className={cn(
        'flex gap-4 rounded-2xl border p-5 transition',
        isDone
          ? 'border-emerald-100 bg-emerald-50/50'
          : 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-card'
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full',
            isDone ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 bg-white'
          )}
        >
          {isDone && (
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
            </svg>
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'text-base font-semibold',
              isDone ? 'text-emerald-900 line-through' : 'text-ink'
            )}
          >
            {t(`${milestone.id}.title`)}
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
            <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
            {style.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{t(`${milestone.id}.body`)}</p>
      </div>
    </article>
  );
}
