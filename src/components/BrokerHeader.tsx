import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from './Logo';
import type { Broker } from '@/types';

export function BrokerHeader({ broker, locale }: { broker: Broker; locale: string }) {
  const t = useTranslations('common');

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-page flex items-center justify-between py-4">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-brand-100">
            <Image
              src={broker.photoUrl}
              alt={broker.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">{broker.company}</div>
            <div className="text-xs text-ink-muted">
              {t('broker')}: {broker.name}
            </div>
          </div>
        </Link>
        <div className="hidden items-center gap-2 text-xs text-ink-muted sm:flex">
          <span>{t('poweredByShort')}</span>
          <Logo variant="mark" className="h-6 w-6" />
        </div>
      </div>
    </header>
  );
}
