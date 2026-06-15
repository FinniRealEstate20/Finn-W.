'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isOnboarded, loadProfile, profileCompleteness } from '@/lib/profileStore';

export function OnboardingGate({ locale }: { locale: string }) {
  const router = useRouter();

  useEffect(() => {
    if (isOnboarded()) return;
    if (profileCompleteness(loadProfile()) >= 60) return;
    router.replace(`/${locale}/onboarding`);
  }, [locale, router]);

  return null;
}
