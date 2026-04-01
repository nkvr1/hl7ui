'use client';

import { useState, useMemo } from 'react';
import { PatientSummary } from '@/lib/types';

export function usePatientSearch(summaries: PatientSummary[]) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'events' | 'date' | 'status'>('events');

  const filtered = useMemo(() => {
    let result = summaries;

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'events':
          return b.eventCount - a.eventCount;
        case 'date':
          return (
            (b.admissionDate?.getTime() ?? 0) -
            (a.admissionDate?.getTime() ?? 0)
          );
        case 'status': {
          const order = { admitted: 0, discharged: 1, cancelled: 2, unknown: 3 };
          return order[a.status] - order[b.status];
        }
        default:
          return 0;
      }
    });

    return result;
  }, [summaries, query, sortBy]);

  return { query, setQuery, sortBy, setSortBy, filtered };
}
