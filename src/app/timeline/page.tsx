'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDataContext } from '@/context/DataContext';
import { createPatientSummaries } from '@/lib/patient-grouper';
import { getFacilityLabel } from '@/lib/hl7-constants';
import { PatientList } from '@/components/patient/PatientList';
import { DoctorView } from '@/components/doctor/DoctorView';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';
import {
  FileJson, Upload, ArrowLeft, PanelLeftClose, PanelLeft,
  Activity, Users, Stethoscope, Building2, X,
} from 'lucide-react';

type SidebarTab = 'patients' | 'doctors';

export default function TimelinePage() {
  const { isLoaded, patientRecords, patientSummaries, fileName, recordCount, skippedCount } =
    useDataContext();
  const [selectedMrn, setSelectedMrn] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('patients');
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Track viewport for responsive behavior
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // Extract unique facilities
  const facilities = useMemo(() => {
    if (!patientRecords.length) return [];
    const facs = new Set<string>();
    patientRecords.forEach((p) => { if (p.facility) facs.add(p.facility); });
    return Array.from(facs).sort();
  }, [patientRecords]);

  // Filter patients by facility
  const filteredPatients = useMemo(() => {
    if (!selectedFacility) return patientRecords;
    return patientRecords.filter((p) => p.facility === selectedFacility);
  }, [patientRecords, selectedFacility]);

  const filteredSummaries = useMemo(() => {
    if (!selectedFacility) return patientSummaries;
    return createPatientSummaries(filteredPatients);
  }, [selectedFacility, filteredPatients, patientSummaries]);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <FileJson className="h-7 w-7 text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">No Data Loaded</h2>
        <p className="text-sm text-gray-500 mb-5">Upload a JSON file to get started</p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl
            hover:bg-gray-800 active:scale-[0.97] transition-all duration-200 shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
      </div>
    );
  }

  const selectedPatient = selectedMrn
    ? patientRecords.find((p) => p.mrn === selectedMrn)
    : null;

  const handleSelectPatient = (mrn: string) => {
    setSelectedMrn(mrn);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="glass border-b border-gray-200/60 px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 z-30 sticky top-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: toggle + back + file info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-200 active:scale-95 touch-target"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>

            <div className="hidden sm:block h-5 w-px bg-gray-200" />

            <button
              onClick={() => router.push('/')}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>

            <div className="hidden sm:block h-5 w-px bg-gray-200" />

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                {fileName}
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                {recordCount.toLocaleString()} records
              </span>
              {skippedCount > 0 && (
                <span className="hidden sm:inline text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                  {skippedCount} skipped
                </span>
              )}
            </div>
          </div>

          {/* Right: facility filter + mobile back */}
          <div className="flex items-center gap-2">
            {facilities.length > 1 && (
              <div className="flex items-center gap-1.5">
                <Building2 className="hidden sm:block h-3.5 w-3.5 text-gray-400" />
                <select
                  value={selectedFacility}
                  onChange={(e) => { setSelectedFacility(e.target.value); setSelectedMrn(null); }}
                  className="text-[11px] sm:text-xs font-semibold border border-gray-200 rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 bg-white text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                    transition-all cursor-pointer max-w-[100px] sm:max-w-none"
                >
                  <option value="">All Facilities</option>
                  {facilities.map((f) => (
                    <option key={f} value={f}>{getFacilityLabel(f)} ({f})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Mobile back button */}
            <button
              onClick={() => router.push('/')}
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 touch-target"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile: condensed info bar */}
        <div className="sm:hidden flex items-center gap-2 mt-1 text-[10px] text-gray-400">
          <span>{recordCount.toLocaleString()} records</span>
          {skippedCount > 0 && (
            <>
              <span>·</span>
              <span className="text-amber-500">{skippedCount} skipped</span>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            bg-white shrink-0 overflow-hidden flex flex-col z-30
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isMobile
              ? `fixed top-0 left-0 h-[100dvh] shadow-2xl ${sidebarOpen ? 'w-[85vw] max-w-[360px]' : 'w-0'}`
              : `border-r border-gray-200/60 ${sidebarOpen ? 'w-80' : 'w-0'}`
            }
          `}
        >
          {/* Mobile sidebar header with close */}
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Activity className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Navigation</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 touch-target"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex border-b border-gray-100 shrink-0">
            <button
              onClick={() => setSidebarTab('patients')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2.5 text-xs font-semibold transition-all touch-target
                ${sidebarTab === 'patients' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Users className="h-3.5 w-3.5" />
              Patients
            </button>
            <button
              onClick={() => setSidebarTab('doctors')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2.5 text-xs font-semibold transition-all touch-target
                ${sidebarTab === 'doctors' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Doctors
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {sidebarTab === 'patients' ? (
              <PatientList
                summaries={filteredSummaries}
                selectedMrn={selectedMrn}
                onSelectPatient={handleSelectPatient}
              />
            ) : (
              <DoctorView
                patients={filteredPatients}
                onSelectPatient={handleSelectPatient}
              />
            )}
          </div>
        </aside>

        {/* Timeline area */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          {selectedPatient ? (
            <div className="p-2.5 sm:p-4 max-w-5xl mx-auto animate-fade-in">
              <TimelineContainer patient={selectedPatient} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <FileJson className="h-6 w-6 text-gray-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">Select a Patient</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1.5 max-w-[240px]">
                {isMobile
                  ? 'Tap the menu button to browse patients'
                  : 'Choose a patient from the sidebar or find them via the Doctors tab'
                }
              </p>
              {isMobile && !sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl
                    active:scale-[0.97] transition-all shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  Browse Patients
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
