'use client';

import { useState, useMemo } from 'react';
import { PatientRecord } from '@/lib/types';
import { formatDateTime } from '@/lib/date-utils';
import { getMessageTypeMeta } from '@/lib/hl7-constants';
import {
  extractDoctors,
  getDoctorDates,
  getDoctorPatientsForDate,
  DoctorDayPatient,
} from '@/lib/doctor-grouper';
import { usePagination } from '@/hooks/usePagination';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  Stethoscope,
  Users,
  Calendar,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';

interface DoctorViewProps {
  patients: PatientRecord[];
  onSelectPatient: (mrn: string) => void;
}

const STATUS_DOT: Record<string, string> = {
  admitted: 'bg-emerald-500',
  discharged: 'bg-red-500',
  cancelled: 'bg-gray-400',
  unknown: 'bg-slate-300',
};

const PAGE_SIZES = [1,5,25, 50, 100];

export function DoctorView({ patients, onSelectPatient }: DoctorViewProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [listPageSize, setListPageSize] = useState(50);
  const [detailPageSize, setDetailPageSize] = useState(25);

  const doctors = useMemo(() => extractDoctors(patients), [patients]);

  const filteredDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const q = search.toLowerCase();
    return doctors.filter((d) => d.name.toLowerCase().includes(q));
  }, [doctors, search]);

  const dates = useMemo(
    () => (selectedDoctor ? getDoctorDates(patients, selectedDoctor) : []),
    [patients, selectedDoctor]
  );

  const dayPatients = useMemo(
    () =>
      selectedDoctor && selectedDate
        ? getDoctorPatientsForDate(patients, selectedDoctor, selectedDate)
        : [],
    [patients, selectedDoctor, selectedDate]
  );

  // Pagination for doctor list
  const listPag = usePagination(filteredDoctors, listPageSize);

  // Pagination for day patients
  const detailPag = usePagination(dayPatients, detailPageSize);

  const handleSelectDoctor = (name: string) => {
    setSelectedDoctor(name);
    const docDates = getDoctorDates(patients, name);
    setSelectedDate(docDates[0] || null);
  };

  // ── Doctor list ──
  if (!selectedDoctor) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 space-y-2 border-b border-gray-100 shrink-0">
          <SearchInput value={search} onChange={setSearch} placeholder="Search doctors..." />
          <PaginationBar
            total={listPag.totalItems}
            label="doctors"
            pageSize={listPageSize}
            onPageSizeChange={(n) => { setListPageSize(n); listPag.goToPage(1); }}
            currentPage={listPag.currentPage}
            totalPages={listPag.totalPages}
            onPageChange={listPag.goToPage}
          />
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {listPag.paginatedItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No doctors found</div>
          ) : (
            listPag.paginatedItems.map((doc) => (
              <button
                key={doc.name}
                onClick={() => handleSelectDoctor(doc.name)}
                className="group w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 active:bg-gray-100/60 transition-all touch-target"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-[13px] font-semibold text-gray-900 truncate">{doc.name}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                        <span className="flex items-center gap-0.5 sm:gap-1"><Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{doc.patientCount}</span>
                        <span>·</span>
                        <span>{doc.eventCount} events</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Doctor detail ──
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 shrink-0">
        <button
          onClick={() => { setSelectedDoctor(null); setSelectedDate(null); }}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-2 group"
        >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
          All Doctors
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{selectedDoctor}</p>
            <p className="text-[11px] text-gray-400">{dates.length} days of activity</p>
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div className="px-3 py-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-[11px] font-semibold text-gray-500">Select Date</span>
        </div>
        <div className="flex gap-1 flex-wrap max-h-[60px] overflow-y-auto">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); detailPag.goToPage(1); }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200
                ${selectedDate === date
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination for patients */}
      {selectedDate && dayPatients.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 shrink-0">
          <PaginationBar
            total={detailPag.totalItems}
            label="patients"
            pageSize={detailPageSize}
            onPageSizeChange={(n) => { setDetailPageSize(n); detailPag.goToPage(1); }}
            currentPage={detailPag.currentPage}
            totalPages={detailPag.totalPages}
            onPageChange={detailPag.goToPage}
          />
        </div>
      )}

      {/* Patient list */}
      <div className="flex-1 overflow-y-auto">
        {selectedDate && dayPatients.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">No patients on this date</div>
        )}
        {detailPag.paginatedItems.map((pt) => (
          <DoctorDayPatientCard key={pt.mrn} patient={pt} onSelect={() => onSelectPatient(pt.mrn)} />
        ))}
      </div>
    </div>
  );
}

/* ── Reusable pagination bar ── */
function PaginationBar({
  total,
  label,
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPageChange,
}: {
  total: number;
  label: string;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-gray-500">
        {total.toLocaleString()} {label}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-[10px] font-semibold text-gray-600 bg-gray-100 border-none rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-bold text-gray-600 tabular-nums min-w-[40px] text-center">
              {currentPage} / {totalPages}
            </span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Patient card ── */
function DoctorDayPatientCard({
  patient,
  onSelect,
}: {
  patient: DoctorDayPatient;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100/60 transition-all group touch-target"
    >
      <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[patient.status] || STATUS_DOT.unknown}`} />
          <span className="text-xs sm:text-[13px] font-semibold text-gray-900 truncate">{patient.displayName}</span>
        </div>
        <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono shrink-0">{patient.mrn}</span>
      </div>
      <div className="space-y-0.5 sm:space-y-1 ml-3.5 sm:ml-4">
        {patient.events.map((evt, i) => {
          const meta = getMessageTypeMeta(evt.messageType);
          return (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.hex }} />
              <span className="font-medium text-gray-600">{evt.label}</span>
              <span className="text-gray-400">{formatDateTime(evt.dateTime).split(',').pop()?.trim()}</span>
              {evt.charges != null && evt.charges > 0 && (
                <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                  <DollarSign className="h-2.5 w-2.5" />{evt.charges.toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </button>
  );
}
