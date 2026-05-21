import { useTranslations } from 'next-intl';
import { MilestoneCard } from './MilestoneCard';
import { progressFor } from '@/lib/milestones';
import type { Milestone, Phase } from '@/types';

export function PhaseSection({ phase, milestones }: { phase: Phase; milestones: Milestone[] }) {
  const t = useTranslations('dashboard');
  const { done, total } = progressFor(milestones);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-brand-700">
            {t('phaseTitle', { number: phase })}
          </div>
          <h2 className="text-lg font-semibold text-ink">
            {t(`phases.${phase}.title`)}
          </h2>
          <p className="text-sm text-ink-muted">{t(`phases.${phase}.subtitle`)}</p>
        </div>
        <span className="text-xs font-medium text-ink-muted">
          {t('tasksDone', { done, total })}
        </span>
      </div>
      <div className="space-y-2">
        {milestones.map(m => (
          <MilestoneCard key={m.id} milestone={m} />
        ))}
      </div>
    </section>
  );
}
