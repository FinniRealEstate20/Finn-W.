import type { FormEntry, HubConditional } from '@/types';
import type { ProfileData } from './profile/types';

export type HubVisibility = 'visible' | 'hidden' | 'ask';

/**
 * Bewertet, ob ein Hub für das aktuelle Profil sichtbar ist.
 *
 * - 'visible' : Bedingung erfüllt oder keine Bedingung.
 * - 'hidden'  : Bedingung explizit nicht erfüllt (z.B. hasGasConnection === false).
 * - 'ask'     : Bedingungsfeld ist noch nicht beantwortet — UI kann eine
 *               kleine „Kurz beantworten"-Karte anzeigen statt Hub oder
 *               kompletter Verstecken. Aufrufer entscheidet.
 */
export function hubVisibility(form: FormEntry, profile: ProfileData): HubVisibility {
  const cond = form.hub?.conditional;
  if (!cond) return 'visible';
  return evaluateConditional(cond, profile);
}

function evaluateConditional(cond: HubConditional, profile: ProfileData): HubVisibility {
  const raw = readProfileField(profile, cond.profileField);
  if (raw === undefined) return 'ask';
  if (cond.truthy !== undefined) {
    return Boolean(raw) === cond.truthy ? 'visible' : 'hidden';
  }
  if (cond.equals !== undefined) {
    return raw === cond.equals ? 'visible' : 'hidden';
  }
  return raw ? 'visible' : 'hidden';
}

function readProfileField(profile: ProfileData, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, profile);
}

/**
 * Filtert die Formulare, die auf der Hub-Übersicht gezeigt werden.
 * Ergänzt die bestehende propertyType-Logik um Conditional-Handling.
 */
export function visibleHubs(
  forms: readonly FormEntry[],
  profile: ProfileData,
  opts: { includeAsk?: boolean } = { includeAsk: true }
): FormEntry[] {
  return forms.filter(f => {
    const v = hubVisibility(f, profile);
    if (v === 'visible') return true;
    if (v === 'ask') return opts.includeAsk !== false;
    return false;
  });
}
