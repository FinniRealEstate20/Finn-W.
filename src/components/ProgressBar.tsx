import { cn } from '@/lib/cn';

export function ProgressBar({
  percent,
  className
}: {
  percent: number;
  className?: string;
}) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-200', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
        style={{ width: `${safe}%` }}
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
