'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProgressBar } from './ProgressBar';
import { loadProfile, profileCompleteness } from '@/lib/profileStore';
import { UserIcon } from './icons';

export function ProfileCompletenessCard({ locale }: { locale: string }) {
  const t = useTranslations('dashboard');
  const [percent, setPercent] = useState<number | null>(null);

  useEffect(() => {
    setPercent(profileCompleteness(loadProfile()));
  }, []);

  if (percent === null || percent >= 100) return null;

  return (
    <section className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600">
          <UserIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">
            {t('profileCard.title')}
          </div>
          <div className="text-xs text-ink-soft">{t('profileCard.subtitle')}</div>
          <div className="mt-2 w-40">
            <ProgressBar percent={percent} />
          </div>
          <div className="mt-1 text-[11px] font-medium text-brand-700">
            {t('profileCard.completeness', { percent })}
          </div>
        </div>
      </div>
      <Link href={`/${locale}/profile`} className="btn-primary text-xs">
        {t('profileCard.cta')}
      </Link>
    </section>
  );
}
