'use server';

import { redirect } from 'next/navigation';

import { clearDemoBuyer, setDemoBuyer } from '@/lib/demoBuyer';
import type { PropertyType } from '@/types';

export async function startLiveDemoAction(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as string) || 'de';
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const propertyType = String(formData.get('propertyType') ?? '') as PropertyType;
  const city = String(formData.get('city') ?? '');
  const moveInDate = String(formData.get('moveInDate') ?? '');

  const ok = await setDemoBuyer({ name, email, propertyType, city, moveInDate });
  if (!ok) {
    redirect(`/${locale}/demo?error=invalid`);
  }
  redirect(`/${locale}/dashboard?from=demo`);
}

export async function resetLiveDemoAction(formData: FormData): Promise<void> {
  const locale = (formData.get('locale') as string) || 'de';
  await clearDemoBuyer();
  redirect(`/${locale}/demo`);
}
