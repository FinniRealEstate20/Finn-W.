'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadProfile, saveProfile } from '@/lib/profileStore';
import type { PropertyType } from '@/types';

const OPTIONS: PropertyType[] = ['ownUse', 'investment-self', 'investment-managed'];

export function OnboardingForm({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');
  const tp = useTranslations('profile');
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('ownUse');
  const [moveInDate, setMoveInDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setFirstName(p.firstName);
    setPropertyType(p.propertyType);
    setMoveInDate(p.moveInDate);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const profile = loadProfile();
    saveProfile({
      ...profile,
      firstName,
      propertyType,
      moveInDate
    });
    router.push(`/${locale}/dashboard`);
  }

  return (
    <form className="card mt-8 space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="name">{t('fields.name')}</label>
        <input
          id="name"
          className="input"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <label className="label">{t('fields.propertyType')}</label>
        <div className="space-y-2">
          {OPTIONS.map(value => {
            const optKey =
              value === 'investment-self'
                ? 'investmentSelfHint'
                : value === 'investment-managed'
                  ? 'investmentManagedHint'
                  : 'ownUseHint';
            const checked = propertyType === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition ${
                  checked
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 bg-white hover:border-brand-200'
                }`}
              >
                <input
                  type="radio"
                  name="propertyType"
                  value={value}
                  checked={checked}
                  onChange={() => setPropertyType(value)}
                  className="mt-1 text-brand-600"
                />
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {t(`fields.propertyTypeOptions.${value}`)}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {t(`fields.propertyTypeOptions.${optKey}`)}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="moveIn">{t('fields.moveInDate')}</label>
          <input
            id="moveIn"
            type="date"
            className="input"
            value={moveInDate}
            onChange={e => setMoveInDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="city">{t('fields.city')}</label>
          <input id="city" className="input" defaultValue="Paderborn" readOnly />
          <div className="mt-1 text-xs text-ink-muted">{t('fields.cityHint')}</div>
        </div>
      </div>

      <p className="text-xs text-ink-muted">{tp('savedHint')}</p>

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {t('submit')}
      </button>
    </form>
  );
}
