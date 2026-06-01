'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProgressBar } from './ProgressBar';
import { lookupAddress } from '@/lib/datasources/client';
import {
  loadProfile,
  profileCompleteness,
  saveProfile,
  type ProfileAddress,
  type ProfileData
} from '@/lib/profileStore';
import type { AddressSuggestion } from '@/lib/datasources/types';
import type { PropertyType } from '@/types';

const PROPERTY_TYPES: PropertyType[] = ['ownUse', 'investment-self', 'investment-managed'];

function inputClass(extra = ''): string {
  return `input ${extra}`.trim();
}

export function ProfileEditor() {
  const t = useTranslations('profile');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const completeness = useMemo(
    () => (profile ? profileCompleteness(profile) : 0),
    [profile]
  );

  function update(next: ProfileData) {
    setProfile(next);
    saveProfile(next);
    setSavedAt(new Date().toISOString());
  }

  function patchAddress(kind: 'newAddress' | 'oldAddress', patch: Partial<ProfileAddress>) {
    if (!profile) return;
    update({ ...profile, [kind]: { ...profile[kind], ...patch } });
  }

  function patchScalar<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    if (!profile) return;
    update({ ...profile, [key]: value });
  }

  function onStreetQuery(query: string) {
    patchAddress('newAddress', { street: query });
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (query.trim().length < 4) {
      setSuggestions([]);
      setLookupOpen(false);
      return;
    }
    lookupTimer.current = setTimeout(async () => {
      try {
        setLookupLoading(true);
        const res = await lookupAddress(query);
        setSuggestions(res.results.slice(0, 6));
        setLookupOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLookupLoading(false);
      }
    }, 320);
  }

  function applySuggestion(s: AddressSuggestion) {
    if (!profile) return;
    update({
      ...profile,
      newAddress: {
        street: s.street || profile.newAddress.street,
        houseNumber: s.houseNumber || profile.newAddress.houseNumber,
        postalCode: s.postalCode || profile.newAddress.postalCode,
        city: s.city || profile.newAddress.city,
        district: s.district || ''
      },
      source: { ...profile.source, newAddress: 'nominatim' }
    });
    setSuggestions([]);
    setLookupOpen(false);
  }

  if (!profile) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="text-sm font-semibold text-ink">
            {t('completeness', { percent: completeness })}
          </div>
          <div className="mt-2 max-w-sm">
            <ProgressBar percent={completeness} />
          </div>
        </div>
        <div className="text-xs text-ink-muted">
          {savedAt ? t('savedHint') : ' '}
        </div>
      </div>

      <section className="card">
        <h2 className="text-sm font-semibold text-ink">{t('sections.personal')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('fields.firstName')}>
            <input
              className={inputClass()}
              value={profile.firstName}
              onChange={e => patchScalar('firstName', e.target.value)}
            />
          </Field>
          <Field label={t('fields.lastName')}>
            <input
              className={inputClass()}
              value={profile.lastName}
              onChange={e => patchScalar('lastName', e.target.value)}
            />
          </Field>
          <Field label={t('fields.email')}>
            <input
              type="email"
              className={inputClass()}
              value={profile.email}
              onChange={e => patchScalar('email', e.target.value)}
            />
          </Field>
          <Field label={t('fields.phone')}>
            <input
              className={inputClass()}
              value={profile.phone}
              onChange={e => patchScalar('phone', e.target.value)}
            />
          </Field>
          <Field label={t('fields.birthDate')}>
            <input
              type="date"
              className={inputClass()}
              value={profile.birthDate}
              onChange={e => patchScalar('birthDate', e.target.value)}
            />
          </Field>
          <Field label={t('fields.steuerId')}>
            <input
              className={inputClass()}
              value={profile.steuerId}
              onChange={e => patchScalar('steuerId', e.target.value)}
            />
          </Field>
          <Field label={t('fields.iban')} full>
            <input
              className={inputClass('font-mono')}
              value={profile.iban}
              onChange={e => patchScalar('iban', e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">{t('sections.newAddress')}</h2>
          {lookupLoading && (
            <span className="text-[11px] text-ink-muted">…sucht</span>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-muted">{t('lookupHint')}</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Field label={t('fields.street')}>
              <input
                className={inputClass()}
                value={profile.newAddress.street}
                onChange={e => onStreetQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setLookupOpen(true)}
                onBlur={() => setTimeout(() => setLookupOpen(false), 150)}
                autoComplete="off"
              />
            </Field>
            {lookupOpen && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                {suggestions.map(s => (
                  <li key={`${s.osmId ?? s.displayName}-${s.lat}`}>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-brand-50"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => applySuggestion(s)}
                    >
                      <div className="font-medium text-ink">
                        {[s.street, s.houseNumber].filter(Boolean).join(' ')}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {[s.postalCode, s.city].filter(Boolean).join(' ')}
                        {s.district ? ` · ${s.district}` : ''}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Field label={t('fields.houseNumber')}>
            <input
              className={inputClass()}
              value={profile.newAddress.houseNumber}
              onChange={e => patchAddress('newAddress', { houseNumber: e.target.value })}
            />
          </Field>
          <Field label={t('fields.postalCode')}>
            <input
              className={inputClass()}
              value={profile.newAddress.postalCode}
              inputMode="numeric"
              maxLength={5}
              onChange={e => patchAddress('newAddress', { postalCode: e.target.value })}
            />
          </Field>
          <Field label={t('fields.city')}>
            <input
              className={inputClass()}
              value={profile.newAddress.city}
              onChange={e => patchAddress('newAddress', { city: e.target.value })}
            />
          </Field>
          <Field label={t('fields.district')}>
            <input
              className={inputClass()}
              value={profile.newAddress.district ?? ''}
              onChange={e => patchAddress('newAddress', { district: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold text-ink">{t('sections.oldAddress')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t('fields.street')} colSpan={2}>
            <input
              className={inputClass()}
              value={profile.oldAddress.street}
              onChange={e => patchAddress('oldAddress', { street: e.target.value })}
            />
          </Field>
          <Field label={t('fields.houseNumber')}>
            <input
              className={inputClass()}
              value={profile.oldAddress.houseNumber}
              onChange={e => patchAddress('oldAddress', { houseNumber: e.target.value })}
            />
          </Field>
          <Field label={t('fields.postalCode')}>
            <input
              className={inputClass()}
              value={profile.oldAddress.postalCode}
              inputMode="numeric"
              maxLength={5}
              onChange={e => patchAddress('oldAddress', { postalCode: e.target.value })}
            />
          </Field>
          <Field label={t('fields.city')} colSpan={2}>
            <input
              className={inputClass()}
              value={profile.oldAddress.city}
              onChange={e => patchAddress('oldAddress', { city: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold text-ink">{t('sections.move')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('fields.moveInDate')}>
            <input
              type="date"
              className={inputClass()}
              value={profile.moveInDate}
              onChange={e => patchScalar('moveInDate', e.target.value)}
            />
          </Field>
          <Field label={t('fields.propertyType')}>
            <select
              className={inputClass()}
              value={profile.propertyType}
              onChange={e => patchScalar('propertyType', e.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map(p => (
                <option key={p} value={p}>
                  {t(`propertyType.${p}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold text-ink">{t('sections.meters')}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('fields.meterElectricity')}>
            <input
              className={inputClass()}
              value={profile.meterReadingElectricity}
              inputMode="numeric"
              onChange={e => patchScalar('meterReadingElectricity', e.target.value)}
            />
          </Field>
          <Field label={t('fields.meterGas')}>
            <input
              className={inputClass()}
              value={profile.meterReadingGas}
              inputMode="numeric"
              onChange={e => patchScalar('meterReadingGas', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  full,
  colSpan,
  children
}: {
  label: string;
  full?: boolean;
  colSpan?: 2 | 3;
  children: React.ReactNode;
}) {
  const cls = full
    ? 'sm:col-span-2'
    : colSpan === 2
      ? 'sm:col-span-2'
      : colSpan === 3
        ? 'sm:col-span-3'
        : '';
  return (
    <div className={cls}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
