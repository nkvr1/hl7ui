'use client';

import { useState } from 'react';
import { PatientSummary } from '@/lib/types';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { usePagination } from '@/hooks/usePagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { PatientListItem } from './PatientListItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PatientListProps {
  summaries: PatientSummary[];
  selectedMrn: string | null;
  onSelectPatient: (mrn: string) => void;
}

const PAGE_SIZES = [5,25, 50, 100];

export function PatientList({
  summaries,
  selectedMrn,
  onSelectPatient,
}: PatientListProps) {
  const [pageSize, setPageSize] = useState(50);
  const { query, setQuery, sortBy, setSortBy, filtered } =
    usePatientSearch(summaries);
  const { currentPage, totalPages, paginatedItems, goToPage, totalItems } =
    usePagination(filtered, pageSize);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-2 border-b border-gray-100 shrink-0">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name or MRN..."
        />

        {/* Row 1: Sort */}
        <div className="flex gap-1">
          {(['events', 'name', 'date', 'status'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all
                ${sortBy === s
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Row 2: Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500">
            {totalItems.toLocaleString()} patients
          </span>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); goToPage(1); }}
              className="text-[10px] font-semibold text-gray-600 bg-gray-100 border-none rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-bold text-gray-600 tabular-nums min-w-[40px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {paginatedItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No patients found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginatedItems.map((patient) => (
              <PatientListItem
                key={patient.mrn}
                patient={patient}
                isSelected={selectedMrn === patient.mrn}
                onClick={() => onSelectPatient(patient.mrn)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
