import { cn } from '@/lib/cn';

export function StatCard({
  label,
  value,
  hint,
  accent
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'brand' | 'amber' | 'emerald';
}) {
  const accentClass =
    accent === 'amber'
      ? 'text-amber-600'
      : accent === 'emerald'
        ? 'text-emerald-600'
        : 'text-brand-600';

  return (
    <div className="card flex flex-col gap-1">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      <div className={cn('text-3xl font-bold', accentClass)}>{value}</div>
      {hint && <div className="text-xs text-ink-muted">{hint}</div>}
    </div>
  );
}
