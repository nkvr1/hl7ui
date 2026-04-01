'use client';

import { AlignHorizontalSpaceAround, AlignVerticalSpaceAround } from 'lucide-react';
import { TimelineLayout } from '@/lib/types';

interface ToggleProps {
  layout: TimelineLayout;
  onToggle: () => void;
}

export function LayoutToggle({ layout, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl
        bg-white text-gray-700 shadow-sm
        hover:bg-gray-50 hover:border-gray-300
        active:scale-[0.97]
        transition-all duration-200"
      title={`Switch to ${layout === 'vertical' ? 'horizontal' : 'vertical'} layout`}
    >
      {layout === 'vertical' ? (
        <>
          <AlignHorizontalSpaceAround className="h-3.5 w-3.5" />
          <span>Horizontal</span>
        </>
      ) : (
        <>
          <AlignVerticalSpaceAround className="h-3.5 w-3.5" />
          <span>Vertical</span>
        </>
      )}
    </button>
  );
}
