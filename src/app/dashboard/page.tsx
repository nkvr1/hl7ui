'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDataContext } from '@/context/DataContext';
import { useTheme } from '@/context/ThemeContext';
import { parseRawData } from '@/lib/parser';
import { groupByPatient, createPatientSummaries } from '@/lib/patient-grouper';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { DateRangeSearch } from '@/components/dashboard/DateRangeSearch';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AdmissionChart } from '@/components/dashboard/AdmissionChart';
import { PatientTable } from '@/components/dashboard/PatientTable';
import { format } from 'date-fns';
import {
  Activity, Loader2, FolderOpen, Menu, X,
} from 'lucide-react';

export default function DashboardPage() {
  const { isLoaded, patientRecords, setData } = useDataContext();
  const { theme } = useTheme();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-load data if not loaded
  useEffect(() => {
    if (isLoaded) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/data-files');
        const { files } = await res.json();
        if (!files?.length) { setLoading(false); return; }

        let allRecords: unknown[] = [];
        for (const file of files) {
          const r = await fetch(`/api/data-files/${encodeURIComponent(file.name)}`);
          const json = await r.json();
          if (Array.isArray(json)) allRecords = allRecords.concat(json);
        }

        const { records, skipped } = parseRawData(allRecords);
        if (records.length > 0) {
          const patients = groupByPatient(records);
          const summaries = createPatientSummaries(patients);
          setData({
            patientRecords: patients,
            patientSummaries: summaries,
            fileName: `All files (${files.length})`,
            recordCount: records.length,
            skippedCount: skipped,
          });
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    })();
  }, [isLoaded, setData]);

  // Filter patients by date range
  const filteredPatients = useMemo(() => {
    if (!dateFrom) return patientRecords;
    const from = new Date(dateFrom + 'T00:00:00');
    const to = new Date((dateTo || dateFrom) + 'T23:59:59');

    return patientRecords.filter((p) => {
      return p.events.some((e) => e.dateTime >= from && e.dateTime <= to);
    });
  }, [patientRecords, dateFrom, dateTo]);

  const handleSearch = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
  };

  const handleSelectPatient = useCallback((mrn: string) => {
    router.push('/timeline');
  }, [router]);

  if (loading) {
    return (
      <div className="dash-root">
        <div className="dash-loading">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="dash-root">
        <div className="dash-loading">
          <FolderOpen className="h-10 w-10" style={{ opacity: 0.4 }} />
          <p>No data files found</p>
          <button onClick={() => router.push('/')} className="dash-btn dash-btn-primary" style={{ marginTop: 16 }}>
            Go to File Loader
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-root">
      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="dash-overlay" onClick={() => setMobileSidebar(false)} />
      )}

      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`dash-sidebar-wrapper ${mobileSidebar ? 'dash-sidebar-mobile-open' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="dash-main">
        {/* Top bar */}
        <header className="dash-header">
          <div className="dash-header-left">
            <button
              className="dash-mobile-menu md:hidden"
              onClick={() => setMobileSidebar(!mobileSidebar)}
            >
              {mobileSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="dash-header-title">
              <Activity className="h-5 w-5" />
              <h1>Patient Dashboard</h1>
            </div>
          </div>
          <div className="dash-header-right">
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="dash-content">
          {/* Search bar */}
          <DateRangeSearch
            onSearch={handleSearch}
            onClear={handleClear}
            hasFilter={!!dateFrom}
          />

          {/* Stats */}
          <StatsCards patients={filteredPatients} />

          {/* Chart */}
          <AdmissionChart patients={filteredPatients} />

          {/* Table */}
          <PatientTable
            patients={filteredPatients}
            onSelectPatient={handleSelectPatient}
          />
        </div>
      </div>
    </div>
  );
}
