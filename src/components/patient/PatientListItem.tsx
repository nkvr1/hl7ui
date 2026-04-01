'use client';

import { PatientSummary } from '@/lib/types';
import { formatDateOnly } from '@/lib/date-utils';

interface PatientListItemProps {
  patient: PatientSummary;
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_CONFIG: Record<
  PatientSummary['status'],
  { dot: string; ring: string; label: string }
> = {
  admitted: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', label: 'Admitted' },
  discharged: { dot: 'bg-red-500', ring: 'ring-red-500/20', label: 'Discharged' },
  cancelled: { dot: 'bg-gray-400', ring: 'ring-gray-400/20', label: 'Cancelled' },
  unknown: { dot: 'bg-slate-300', ring: 'ring-slate-300/20', label: 'Unknown' },
};

export function PatientListItem({
  patient,
  isSelected,
  onClick,
}: PatientListItemProps) {
  const status = STATUS_CONFIG[patient.status];

  return (
    <button
      onClick={onClick}
      className={`
        group w-full text-left px-4 py-3 transition-all duration-200 relative
        ${isSelected
          ? 'bg-blue-50/80'
          : 'hover:bg-gray-50/80 active:bg-gray-100/60'
        }
      `}
    >
      {/* Selection indicator */}
      <div
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300
          ${isSelected ? 'h-8 bg-blue-500' : 'h-0 bg-transparent'}
        `}
      />

      <div className="flex items-center justify-between">
        <span className={`font-semibold text-[13px] truncate transition-colors ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {patient.displayName}
        </span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className={`w-2 h-2 rounded-full ${status.dot} ring-2 ${status.ring}`} title={status.label} />
          <span className={`text-xs font-semibold tabular-nums ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
            {patient.eventCount}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[11px] text-gray-400 font-mono">{patient.mrn}</span>
        {patient.admissionDate && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">
              {formatDateOnly(patient.admissionDate)}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
