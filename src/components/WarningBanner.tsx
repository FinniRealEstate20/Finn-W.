import { AlertTriangleIcon } from './icons';
import { cn } from '@/lib/cn';

export type WarningTone = 'info' | 'warn' | 'critical' | 'expired';

const TONE_STYLES: Record<WarningTone, { bg: string; ring: string; text: string; icon: string }> = {
  info: {
    bg: 'bg-sky-50',
    ring: 'ring-sky-200',
    text: 'text-sky-900',
    icon: 'text-sky-600'
  },
  warn: {
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    text: 'text-amber-900',
    icon: 'text-amber-700'
  },
  critical: {
    bg: 'bg-orange-50',
    ring: 'ring-orange-200',
    text: 'text-orange-900',
    icon: 'text-orange-700'
  },
  expired: {
    bg: 'bg-rose-50',
    ring: 'ring-rose-200',
    text: 'text-rose-900',
    icon: 'text-rose-700'
  }
};

interface Props {
  tone: WarningTone;
  title?: string;
  message: string;
  detail?: string;
  className?: string;
}

export function WarningBanner({ tone, title, message, detail, className }: Props) {
  const s = TONE_STYLES[tone];
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3 ring-1',
        s.bg,
        s.ring,
        s.text,
        className
      )}
    >
      <AlertTriangleIcon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', s.icon)} />
      <div className="min-w-0 flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        <div className={cn('text-sm', title ? 'mt-0.5' : '')}>{message}</div>
        {detail && <div className="mt-1 text-xs opacity-80">{detail}</div>}
      </div>
    </div>
  );
}
