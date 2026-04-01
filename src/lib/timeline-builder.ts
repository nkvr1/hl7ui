import {
  TimelineEvent,
  TimelineItem,
  CollapsedGroup,
  TimelineEventCategory,
} from './types';

const COLLAPSE_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Build timeline items from sorted events, collapsing rapid-fire same-type events.
 */
export function buildTimelineItems(
  events: TimelineEvent[],
  collapseThresholdMs: number = COLLAPSE_THRESHOLD_MS
): TimelineItem[] {
  if (events.length === 0) return [];

  const items: TimelineItem[] = [];
  let i = 0;

  while (i < events.length) {
    const current = events[i];

    // Don't collapse admission or discharge events
    if (
      current.category === 'admission' ||
      current.category === 'discharge'
    ) {
      items.push(current);
      i++;
      continue;
    }

    // Look ahead for consecutive same-category events within threshold
    const groupEvents: TimelineEvent[] = [current];
    let j = i + 1;

    while (j < events.length) {
      const next = events[j];
      const timeDiff =
        next.dateTime.getTime() - groupEvents[groupEvents.length - 1].dateTime.getTime();

      if (next.category === current.category && timeDiff <= collapseThresholdMs) {
        groupEvents.push(next);
        j++;
      } else {
        break;
      }
    }

    if (groupEvents.length >= 3) {
      // Collapse into a group
      const group: CollapsedGroup = {
        type: 'collapsed',
        events: groupEvents,
        startTime: groupEvents[0].dateTime,
        endTime: groupEvents[groupEvents.length - 1].dateTime,
        count: groupEvents.length,
        category: current.category,
        label: `${groupEvents.length} ${current.label}s`,
      };
      items.push(group);
    } else {
      // Not enough to collapse, add individually
      for (const event of groupEvents) {
        items.push(event);
      }
    }

    i = j;
  }

  return items;
}

/**
 * Calculate the percentage position of a date within a time range.
 */
export function getPositionPercent(
  date: Date,
  start: Date,
  end: Date
): number {
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 50;
  const offset = date.getTime() - start.getTime();
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

/**
 * Filter events by categories.
 */
export function filterEventsByCategory(
  events: TimelineEvent[],
  activeCategories: TimelineEventCategory[]
): TimelineEvent[] {
  if (activeCategories.length === 0) return events;
  return events.filter((e) => activeCategories.includes(e.category));
}

/**
 * Detect location changes between consecutive events.
 */
export function detectLocationChanges(
  events: TimelineEvent[]
): Map<string, { from: string; to: string }> {
  const changes = new Map<string, { from: string; to: string }>();

  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];
    const prevLoc = formatLocation(prev.location);
    const currLoc = formatLocation(curr.location);

    if (prevLoc !== currLoc && currLoc) {
      changes.set(curr.id, { from: prevLoc, to: currLoc });
    }
  }

  return changes;
}

export function formatLocation(location: {
  unit: string;
  room?: string;
  bed?: string;
}): string {
  const parts = [location.unit];
  if (location.room) parts.push(`Rm ${location.room}`);
  if (location.bed) parts.push(`Bed ${location.bed}`);
  return parts.filter(Boolean).join(' ');
}
