import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { readDemoBuyer } from '@/lib/demoBuyer';

import { resetLiveDemoAction } from '@/app/[locale]/demo/actions';

export async function DemoModeBanner({ locale }: { locale: string }) {
  const demo = await readDemoBuyer();
  if (!demo) return null;
  const t = await getTranslations('demoBanner');

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
        <div className="flex items-center gap-2 text-amber-900">
          <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          <span className="font-semibold uppercase tracking-wide">{t('badge')}</span>
          <span>{t('runningAs', { name: demo.name })}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/demo`} className="font-medium text-amber-900 hover:underline">
            {t('editLink')}
          </Link>
          <form action={resetLiveDemoAction}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="font-medium text-amber-900 hover:underline">
              {t('exitLink')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
