import { cn } from '@/lib/cn';

export function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeCls = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map(s => (
        <svg
          key={s}
          viewBox="0 0 20 20"
          className={cn(sizeCls, s <= Math.round(value) ? 'text-amber-400' : 'text-slate-200')}
          fill="currentColor"
        >
          <path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.8 4.8 17.5l1-5.8L1.5 7.6l5.9-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
