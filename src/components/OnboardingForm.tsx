'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadProfile, markOnboarded, saveProfile, type ProfileData } from '@/lib/profileStore';
import { saveProfileAction } from '@/lib/profile/saveAction';
import type { PropertyType } from '@/types';

const TOTAL_STEPS = 4;
const OPTIONS: PropertyType[] = ['ownUse', 'investment-self', 'investment-managed'];

function digitsOnly(v: string): string {
  return v.replace(/\D/g, '');
}

function isValidEmail(v: string): boolean {
  return /^.+@.+\..+$/.test(v.trim());
}

export function OnboardingForm({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');
  const tc = useTranslations('common');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  if (!profile) {
    return (
      <div className="card mt-8 animate-pulse">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 h-9 rounded bg-slate-100" />
        <div className="mt-3 h-9 rounded bg-slate-100" />
      </div>
    );
  }

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile(prev => (prev ? { ...prev, [key]: value } : prev));
  }
  function updateAddress(which: 'newAddress' | 'oldAddress', field: string, value: string) {
    setProfile(prev =>
      prev ? { ...prev, [which]: { ...prev[which], [field]: value } } : prev
    );
  }

  const step1Valid =
    profile.firstName.trim().length > 1 &&
    profile.lastName.trim().length > 1 &&
    isValidEmail(profile.email) &&
    profile.birthDate.length === 10 &&
    digitsOnly(profile.steuerId).length >= 10;
  const step2Valid =
    profile.newAddress.street.trim().length > 0 &&
    profile.newAddress.houseNumber.trim().length > 0 &&
    /^\d{5}$/.test(profile.newAddress.postalCode) &&
    profile.newAddress.city.trim().length > 1 &&
    profile.moveInDate.length === 10;
  const step3Valid = digitsOnly(profile.iban).length >= 18;

  function handleNext() {
    if (step < TOTAL_STEPS) {
      saveProfile(profile!);
      setStep(s => s + 1);
    }
  }
  function handleBack() {
    if (step > 1) setStep(s => s - 1);
  }
  function handleFinish() {
    setSubmitting(true);
    saveProfile(profile!);
    markOnboarded();
    void saveProfileAction(profile!).finally(() => {
      router.push(`/${locale}/dashboard`);
    });
  }

  const canForward =
    (step === 1 && step1Valid) ||
    (step === 2 && step2Valid) ||
    (step === 3 && step3Valid) ||
    step === 4;

  return (
    <form
      className="card mt-8 space-y-6"
      onSubmit={e => {
        e.preventDefault();
        if (step === TOTAL_STEPS) handleFinish();
        else if (canForward) handleNext();
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t('stepLabel', { current: step, total: TOTAL_STEPS })}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full ${
                i + 1 <= step ? 'bg-brand-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink">{t(`steps.${step}.title`)}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t(`steps.${step}.subtitle`)}</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="firstName">{t('fields.firstName')}</label>
              <input
                id="firstName"
                className="input"
                value={profile.firstName}
                onChange={e => update('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="lastName">{t('fields.lastName')}</label>
              <input
                id="lastName"
                className="input"
                value={profile.lastName}
                onChange={e => update('lastName', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="email">{t('fields.email')}</label>
            <input
              id="email"
              type="email"
              className="input"
              value={profile.email}
              onChange={e => update('email', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="phone">{t('fields.phone')}</label>
              <input
                id="phone"
                type="tel"
                className="input"
                value={profile.phone}
                onChange={e => update('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="birthDate">{t('fields.birthDate')}</label>
              <input
                id="birthDate"
                type="date"
                className="input"
                value={profile.birthDate}
                onChange={e => update('birthDate', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="steuerId">{t('fields.steuerId')}</label>
            <input
              id="steuerId"
              className="input"
              value={profile.steuerId}
              onChange={e => update('steuerId', e.target.value)}
              placeholder="11 Ziffern"
            />
            <div className="mt-1 text-xs text-ink-muted">{t('fields.steuerIdHint')}</div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="label">{t('fields.newAddressTitle')}</legend>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label" htmlFor="newStreet">{t('fields.street')}</label>
                <input
                  id="newStreet"
                  className="input"
                  value={profile.newAddress.street}
                  onChange={e => updateAddress('newAddress', 'street', e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="newHouseNumber">{t('fields.houseNumber')}</label>
                <input
                  id="newHouseNumber"
                  className="input"
                  value={profile.newAddress.houseNumber}
                  onChange={e => updateAddress('newAddress', 'houseNumber', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="newPostalCode">{t('fields.postalCode')}</label>
                <input
                  id="newPostalCode"
                  className="input"
                  value={profile.newAddress.postalCode}
                  onChange={e => updateAddress('newAddress', 'postalCode', e.target.value)}
                  inputMode="numeric"
                  maxLength={5}
                />
              </div>
              <div className="col-span-2">
                <label className="label" htmlFor="newCity">{t('fields.city')}</label>
                <input
                  id="newCity"
                  className="input"
                  value={profile.newAddress.city}
                  onChange={e => updateAddress('newAddress', 'city', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="label">{t('fields.oldAddressTitle')}</legend>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label" htmlFor="oldStreet">{t('fields.street')}</label>
                <input
                  id="oldStreet"
                  className="input"
                  value={profile.oldAddress.street}
                  onChange={e => updateAddress('oldAddress', 'street', e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="oldHouseNumber">{t('fields.houseNumber')}</label>
                <input
                  id="oldHouseNumber"
                  className="input"
                  value={profile.oldAddress.houseNumber}
                  onChange={e => updateAddress('oldAddress', 'houseNumber', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="oldPostalCode">{t('fields.postalCode')}</label>
                <input
                  id="oldPostalCode"
                  className="input"
                  value={profile.oldAddress.postalCode}
                  onChange={e => updateAddress('oldAddress', 'postalCode', e.target.value)}
                  inputMode="numeric"
                  maxLength={5}
                />
              </div>
              <div className="col-span-2">
                <label className="label" htmlFor="oldCity">{t('fields.city')}</label>
                <input
                  id="oldCity"
                  className="input"
                  value={profile.oldAddress.city}
                  onChange={e => updateAddress('oldAddress', 'city', e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label className="label" htmlFor="moveIn">{t('fields.moveInDate')}</label>
            <input
              id="moveIn"
              type="date"
              className="input"
              value={profile.moveInDate}
              onChange={e => update('moveInDate', e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="iban">{t('fields.iban')}</label>
            <input
              id="iban"
              className="input font-mono"
              value={profile.iban}
              onChange={e => update('iban', e.target.value)}
              placeholder="DE89 ..."
            />
            <div className="mt-1 text-xs text-ink-muted">{t('fields.ibanHint')}</div>
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
                const checked = profile.propertyType === value;
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
                      onChange={() => update('propertyType', value)}
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
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="meterElectricity">{t('fields.meterElectricity')}</label>
              <input
                id="meterElectricity"
                className="input"
                value={profile.meterReadingElectricity}
                onChange={e => update('meterReadingElectricity', e.target.value)}
                placeholder={t('fields.meterPlaceholder')}
              />
            </div>
            <div>
              <label className="label" htmlFor="meterGas">{t('fields.meterGas')}</label>
              <input
                id="meterGas"
                className="input"
                value={profile.meterReadingGas}
                onChange={e => update('meterReadingGas', e.target.value)}
                placeholder={t('fields.meterPlaceholder')}
              />
            </div>
          </div>
          <p className="text-xs text-ink-muted">{t('steps.4.skipHint')}</p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {step > 1 ? (
          <button type="button" onClick={handleBack} className="btn-secondary sm:w-auto">
            {tc('back')}
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="submit"
            disabled={!canForward}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {tc('next')} →
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50 sm:w-auto"
          >
            {t('finish')}
          </button>
        )}
      </div>
    </form>
  );
}
