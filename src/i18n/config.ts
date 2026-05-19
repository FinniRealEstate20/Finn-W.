export const locales = ['de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const localeLabels: Record<Locale, string> = {
  de: 'Deutsch'
};

export const rtlLocales: readonly string[] = ['ar'];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale);
}

// Geplante zusätzliche Sprachen: Türkisch, Arabisch, Russisch.
// Die Infrastruktur (Locale-Routing, RTL, Switch) ist vorbereitet –
// es fehlen nur die Übersetzungsdateien unter src/i18n/locales/.
