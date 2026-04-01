'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-xs">
      <span className="text-gray-400 font-medium">{totalItems.toLocaleString()} patients</span>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-3 py-1 text-gray-600 font-semibold tabular-nums">
          {currentPage} <span className="text-gray-300">/</span> {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
