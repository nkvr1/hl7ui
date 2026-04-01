'use client';

import { useState } from 'react';
import { TimelineLayout } from '@/lib/types';

export function useTimelineLayout() {
  const [layout, setLayout] = useState<TimelineLayout>('vertical');

  const toggleLayout = () => {
    setLayout((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'));
  };

  return { layout, setLayout, toggleLayout };
}
