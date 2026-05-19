export function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = new Date(iso).getTime();
  return Math.round((target - now.getTime()) / (1000 * 60 * 60 * 24));
}
