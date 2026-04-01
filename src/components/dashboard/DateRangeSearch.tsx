'use client';

import { useState } from 'react';
import { Calendar, Search, X } from 'lucide-react';

interface DateRangeSearchProps {
  onSearch: (from: string, to: string) => void;
  onClear: () => void;
  hasFilter: boolean;
}

export function DateRangeSearch({ onSearch, onClear, hasFilter }: DateRangeSearchProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSearch = () => {
    if (fromDate) {
      onSearch(fromDate, toDate || fromDate);
    }
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    onClear();
  };

  const handleSingleDate = (date: string) => {
    setFromDate(date);
    setToDate(date);
    if (date) onSearch(date, date);
  };

  return (
    <div className="dash-search-bar">
      <div className="dash-search-group">
        <Calendar className="dash-search-icon" />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="dash-input"
          placeholder="From date"
        />
      </div>

      <span className="dash-search-separator">to</span>

      <div className="dash-search-group">
        <Calendar className="dash-search-icon" />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="dash-input"
          placeholder="To date"
        />
      </div>

      <button onClick={handleSearch} className="dash-btn dash-btn-primary" disabled={!fromDate}>
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
      </button>

      {hasFilter && (
        <button onClick={handleClear} className="dash-btn dash-btn-ghost">
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      )}
    </div>
  );
}
