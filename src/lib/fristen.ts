import type { DeadlineAnchor, DeadlineSeverity, HubDeadline } from '@/types';
import type { ProfileData } from './profile/types';

export type WarnLevel = 'green' | 'yellow' | 'orange' | 'red' | 'expired';

export interface DeadlineInfo {
  target: Date;
  daysLeft: number;           // negativ wenn Frist verstrichen
  severity: DeadlineSeverity;
  level: WarnLevel;
  countdown: string;          // „in 12 Tagen", „vor 3 Tagen", „heute"
  message: string;
}

/**
 * Anker-Datum aus dem Profil ziehen. Für moveInDate/purchaseDate.
 * Gibt null zurück wenn das Feld leer/ungültig ist.
 */
export function anchorDate(anchor: DeadlineAnchor, profile: ProfileData): Date | null {
  const raw = anchor === 'moveInDate' ? profile.moveInDate : profile.purchaseDate;
  if (!raw || raw.length !== 10) return null;
  const d = new Date(`${raw}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

export function daysUntil(target: Date, from: Date = today()): number {
  const oneDay = 1000 * 60 * 60 * 24;
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const f = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round((t - f) / oneDay);
}

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function formatCountdown(daysLeft: number): string {
  if (daysLeft === 0) return 'heute fällig';
  if (daysLeft === 1) return 'morgen fällig';
  if (daysLeft === -1) return 'gestern verstrichen';
  if (daysLeft > 0) return `in ${daysLeft} Tagen fällig`;
  return `vor ${Math.abs(daysLeft)} Tagen verstrichen`;
}

/**
 * Ampel-Level. Mapping ist bewusst konservativ:
 * - info      : rein informativ, bleibt grün bis 3 Tage vor Ablauf
 * - warn      : gelb ab 30 Tagen, orange ab 14 Tagen, rot verstrichen
 * - critical  : gelb ab 60 Tagen, orange ab 30, rot ab 14, expired danach
 */
export function warnLevel(daysLeft: number, severity: DeadlineSeverity): WarnLevel {
  if (severity === 'critical') {
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 14) return 'red';
    if (daysLeft <= 30) return 'orange';
    if (daysLeft <= 60) return 'yellow';
    return 'green';
  }
  if (severity === 'warn') {
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'red';
    if (daysLeft <= 14) return 'orange';
    if (daysLeft <= 30) return 'yellow';
    return 'green';
  }
  // info
  if (daysLeft < 0) return 'orange';
  if (daysLeft <= 3) return 'yellow';
  return 'green';
}

export function computeDeadline(
  deadline: HubDeadline,
  profile: ProfileData
): DeadlineInfo | null {
  const anchor = anchorDate(deadline.anchor, profile);
  if (!anchor) return null;
  const target = new Date(anchor);
  target.setDate(target.getDate() + deadline.offsetDays);
  const daysLeft = daysUntil(target);
  return {
    target,
    daysLeft,
    severity: deadline.severity,
    level: warnLevel(daysLeft, deadline.severity),
    countdown: formatCountdown(daysLeft),
    message: deadline.message
  };
}

export function formatDeadlineDate(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}
