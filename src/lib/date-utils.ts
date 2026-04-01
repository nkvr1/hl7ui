import { format, formatDistanceToNow } from 'date-fns';

/**
 * Parse HL7 datetime format (YYYYMMDDHHMMSS) into a Date object.
 * Handles partial formats: YYYYMMDD, YYYYMMDDHHMM, YYYYMMDDHHMMSS
 */
export function parseHL7DateTime(hl7Date: string | undefined | null): Date | null {
  if (!hl7Date || typeof hl7Date !== 'string') return null;

  const cleaned = hl7Date.replace(/[^0-9]/g, '');
  if (cleaned.length < 8) return null;

  const year = parseInt(cleaned.substring(0, 4));
  const month = parseInt(cleaned.substring(4, 6)) - 1;
  const day = parseInt(cleaned.substring(6, 8));
  const hour = cleaned.length >= 10 ? parseInt(cleaned.substring(8, 10)) : 0;
  const minute = cleaned.length >= 12 ? parseInt(cleaned.substring(10, 12)) : 0;
  const second = cleaned.length >= 14 ? parseInt(cleaned.substring(12, 14)) : 0;

  const date = new Date(year, month, day, hour, minute, second);
  if (isNaN(date.getTime())) return null;

  return date;
}

export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatDateOnly(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function formatDateOnlyShort(date: Date): string {
  return format(date, 'MMM d');
}

export function formatTimeOnly(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return 'N/A';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (diffDays > 0) {
    return `${diffDays}d ${remainingHours}h`;
  }
  if (diffHours > 0) {
    return `${diffHours}h`;
  }
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return `${diffMins}m`;
}
