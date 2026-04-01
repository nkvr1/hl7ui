'use client';

import { TimelineEventCategory } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/hl7-constants';

interface TimelineFiltersProps {
  activeCategories: TimelineEventCategory[];
  onToggleCategory: (category: TimelineEventCategory) => void;
}

const CATEGORY_COLORS: Record<TimelineEventCategory, { active: string; dot: string }> = {
  admission: { active: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  discharge: { active: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  update: { active: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  transfer: { active: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  cancel: { active: 'bg-gray-100 text-gray-700 border-gray-300', dot: 'bg-gray-500' },
  document: { active: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

export function TimelineFilters({
  activeCategories,
  onToggleCategory,
}: TimelineFiltersProps) {
  const allCategories: TimelineEventCategory[] = [
    'admission', 'discharge', 'update', 'transfer', 'cancel', 'document',
  ];

  return (
    <div className="flex gap-1 sm:gap-1.5 flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar">
      {allCategories.map((cat) => {
        const isActive = activeCategories.length === 0 || activeCategories.includes(cat);
        const colors = CATEGORY_COLORS[cat];

        return (
          <button
            key={cat}
            onClick={() => onToggleCategory(cat)}
            className={`
              inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5
              text-[10px] sm:text-[11px] font-semibold rounded-lg border
              transition-all duration-200 active:scale-[0.96] whitespace-nowrap shrink-0 touch-target
              ${isActive
                ? `${colors.active} shadow-sm`
                : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300'
              }
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${!isActive ? 'opacity-30' : ''} transition-opacity`} />
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
