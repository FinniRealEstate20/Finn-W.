import { cn } from '@/lib/cn';
import type { DeadlineInfo } from '@/lib/fristen';

const LEVEL_STYLES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  yellow: 'bg-amber-50 text-amber-800 ring-amber-200',
  orange: 'bg-orange-50 text-orange-800 ring-orange-200',
  red: 'bg-rose-50 text-rose-800 ring-rose-200',
  expired: 'bg-rose-100 text-rose-900 ring-rose-300'
} as const;

interface Props {
  deadline: DeadlineInfo;
  className?: string;
}

/**
 * Kleine Pille für die Hub-Übersicht ("in 12 Tagen fällig" o. ä.).
 * Rendert nichts wenn Ampel grün UND Frist > 60 Tage entfernt — dann
 * ist der Countdown noch nicht relevant.
 */
export function DeadlineBadge({ deadline, className }: Props) {
  if (deadline.level === 'green' && deadline.daysLeft > 60) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
        LEVEL_STYLES[deadline.level],
        className
      )}
      title={deadline.message}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {deadline.countdown}
    </span>
  );
}
