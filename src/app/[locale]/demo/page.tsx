import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

import { Logo } from '@/components/Logo';
import { readDemoBuyer } from '@/lib/demoBuyer';
import { progressFor } from '@/lib/milestones';
import { mockBuyers } from '@/lib/mockData';
import type { PropertyType } from '@/types';

import { LiveDemoForm } from './LiveDemoForm';
import { PersonaCards } from './PersonaCards';

const PERSONA_TAGLINES: Record<string, string> = {
  'julia-m': 'Erstkäuferin, Eigennutzung, Phase 2',
  'lukas-b': 'Kapitalanleger mit Selbstverwaltung, Mietersuche läuft',
  'sabine-r': 'Erfahrene Investorin, Hausverwaltung übernimmt',
};

export default async function DemoStartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('demoStart');

  const existing = await readDemoBuyer();
  const existingForForm = existing
    ? {
        name: existing.name,
        email: existing.email ?? '',
        propertyType: existing.propertyType as PropertyType,
        city: existing.city,
        moveInDate: existing.moveInDate,
      }
    : null;

  const personas = mockBuyers.map(b => ({
    id: b.id,
    name: b.name,
    tagline: PERSONA_TAGLINES[b.id] ?? '',
    propertyType: b.propertyType,
    city: b.city,
    progressPercent: progressFor(b.milestones).percent,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-ink-soft">
            <Logo variant="mark" className="h-6 w-6" />
            <span className="font-semibold text-ink">PropAfterCare</span>
            <span>·</span>
            <span>{t('eyebrow')}</span>
          </div>

          <div className="card">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{t('title')}</h1>
            <p className="mt-2 text-ink-soft">{t('subtitle')}</p>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  {t('personasHeading')}
                </h2>
                <span className="text-xs text-ink-muted">{t('personasHint')}</span>
              </div>
              <PersonaCards personas={personas} locale={locale} />
            </div>

            <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-muted">
              <span className="flex-1 border-t border-slate-200" />
              <span>{t('orSeparator')}</span>
              <span className="flex-1 border-t border-slate-200" />
            </div>

            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              {t('customHeading')}
            </h2>

            {existing && (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <div className="flex-1">
                  <div className="font-medium">
                    {t('existingHeading', { name: existing.name })}
                  </div>
                  <div className="mt-0.5 text-xs text-emerald-800">{t('existingHint')}</div>
                </div>
                <Link href={`/${locale}/dashboard`} className="btn-primary py-1.5 text-xs">
                  {t('continueCta')}
                </Link>
              </div>
            )}

            <LiveDemoForm
              locale={locale}
              existing={existingForForm}
              labels={{
                nameLabel: t('nameLabel'),
                namePlaceholder: t('namePlaceholder'),
                emailLabel: t('emailLabel'),
                emailPlaceholder: t('emailPlaceholder'),
                optional: t('optional'),
                propertyTypeLabel: t('propertyTypeLabel'),
                propOwnUse: t('propertyType.ownUse'),
                propInvestmentSelf: t('propertyType.investmentSelf'),
                propInvestmentManaged: t('propertyType.investmentManaged'),
                cityLabel: t('cityLabel'),
                cityPlaceholder: t('cityPlaceholder'),
                moveInLabel: t('moveInLabel'),
                startCta: t('startCta'),
                restartCta: t('restartCta'),
                privacyNote: t('privacyNote'),
                clearCta: t('clearCta'),
                errorGeneric: t('errorInvalid'),
              }}
            />
          </div>

          <p className="mt-6 text-center text-xs text-ink-muted">{t('footerHint')}</p>
        </div>
      </div>
    </main>
  );
}
