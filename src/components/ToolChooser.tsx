import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { progressFor } from '@/lib/milestones';
import type { Milestone } from '@/types';

interface ToolChooserProps {
  locale: string;
  milestones: readonly Milestone[];
  variant?: 'app' | 'demo';
}

export async function ToolChooser({
  locale,
  milestones,
  variant = 'app',
}: ToolChooserProps) {
  const t = await getTranslations('toolChooser');
  const { done, total, percent } = progressFor(milestones);
  const nextOpen = milestones.find(m => m.status !== 'done');

  const hubHref = `/${locale}/documents`;
  const milestonesHref = `/${locale}/milestones`;
  const aiHref = `/${locale}/chat`;

  return (
    <section aria-label={t('regionLabel')} className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Link
        href={hubHref}
        className="card group flex flex-col gap-3 transition hover:border-brand-300 hover:shadow-lg"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="15" y2="17" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink">{t('hub.title')}</h3>
          <p className="mt-1 text-sm text-ink-soft">{t('hub.body')}</p>
        </div>
        <div className="mt-auto text-xs font-medium text-brand-700">{t('hub.meta')}</div>
      </Link>

      <Link
        href={milestonesHref}
        className="card group flex flex-col gap-3 transition hover:border-brand-300 hover:shadow-lg"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink">{t('milestones.title')}</h3>
          <p className="mt-1 text-sm text-ink-soft">
            {nextOpen
              ? t('milestones.nextHint', { task: t(`milestoneLabels.${nextOpen.id}`) })
              : t('milestones.allDone')}
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink-soft">
              {t('milestones.progress', { done, total })}
            </span>
            <span className="font-semibold text-emerald-700">{percent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </Link>

      <Link
        href={aiHref}
        className="card group flex flex-col gap-3 transition hover:border-brand-300 hover:shadow-lg"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink">{t('ai.title')}</h3>
          <p className="mt-1 text-sm text-ink-soft">{t('ai.body')}</p>
        </div>
        <div className="mt-auto text-xs font-medium text-violet-700">{t('ai.meta')}</div>
      </Link>

      {variant === 'demo' && (
        <p className="md:col-span-3 text-center text-xs text-ink-muted">{t('demoNote')}</p>
      )}
    </section>
  );
}
