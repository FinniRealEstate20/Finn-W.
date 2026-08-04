import { WarningBanner, type WarningTone } from './WarningBanner';
import type { DeadlineInfo } from '@/lib/fristen';
import { formatDeadlineDate } from '@/lib/fristen';

const LEVEL_TO_TONE: Record<DeadlineInfo['level'], WarningTone | null> = {
  green: null,
  yellow: 'info',
  orange: 'warn',
  red: 'critical',
  expired: 'expired'
};

interface Props {
  deadline: DeadlineInfo;
  className?: string;
}

/**
 * Großer Warn-Banner im Hub-Detail. Rendert nur wenn Ampel ≥ yellow —
 * wenn noch grün, ist die Frist zu weit weg, um Aufmerksamkeit zu
 * verdienen.
 */
export function DeadlineBanner({ deadline, className }: Props) {
  const tone = LEVEL_TO_TONE[deadline.level];
  if (!tone) return null;
  const title =
    deadline.level === 'expired'
      ? `Frist verstrichen — ${formatDeadlineDate(deadline.target)}`
      : `Frist: ${deadline.countdown} — ${formatDeadlineDate(deadline.target)}`;
  return (
    <WarningBanner
      tone={tone}
      title={title}
      message={deadline.message}
      className={className}
    />
  );
}
