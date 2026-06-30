import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Logo } from './Logo';
import { BuyerSwitcher } from './BuyerSwitcher';
import { mockBuyers } from '@/lib/mockData';
import { readDemoBuyer } from '@/lib/demoBuyer';
import type { Broker } from '@/types';

export async function BrokerHeader({
  broker,
  locale,
  activeBuyerId
}: {
  broker: Broker;
  locale: string;
  activeBuyerId: string;
}) {
  const t = await getTranslations('common');
  const tc = await getTranslations('toolChooser');
  const demo = await readDemoBuyer();

  const switcherBuyers = [
    ...mockBuyers.map(b => ({
      id: b.id,
      name: b.name,
      propertyType: b.propertyType,
      isLive: false as const
    })),
    ...(demo
      ? [{
          id: demo.id,
          name: tc('switcherLiveLabel', { name: demo.name.split(' ')[0] }),
          propertyType: demo.propertyType,
          isLive: true as const
        }]
      : [])
  ];

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
        <div className="flex items-center gap-3">
          <BuyerSwitcher
            buyers={switcherBuyers}
            activeId={activeBuyerId}
            locale={locale}
          />
          <div className="hidden items-center gap-2 text-xs text-ink-muted sm:flex">
            <span>{t('poweredByShort')}</span>
            <Logo variant="mark" className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
