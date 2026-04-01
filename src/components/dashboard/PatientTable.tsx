'use client';

import { useState, useMemo } from 'react';
import { PatientRecord } from '@/lib/types';
import { formatDateOnly } from '@/lib/date-utils';
import { formatLocation } from '@/lib/timeline-builder';
import { PATIENT_CLASS_LABELS, getFacilityLabel } from '@/lib/hl7-constants';
import { ChevronLeft, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PatientTableProps {
  patients: PatientRecord[];
  onSelectPatient: (mrn: string) => void;
}

const PAGE_SIZE = 20;

export function PatientTable({ patients, onSelectPatient }: PatientTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.last.toLowerCase().includes(q) ||
        p.name.first.toLowerCase().includes(q) ||
        p.mrn.includes(q)
    );
  }, [patients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'admitted': return 'dash-badge-admitted';
      case 'discharged': return 'dash-badge-discharged';
      case 'cancelled': return 'dash-badge-cancelled';
      default: return 'dash-badge-unknown';
    }
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Patient List</h3>
        <div className="dash-table-controls">
          <div className="dash-table-search">
            <Search className="h-3.5 w-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search patients..."
              className="dash-input-inline"
            />
          </div>
          <span className="dash-table-count">
            {filtered.length.toLocaleString()} patients
          </span>
        </div>
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Status</th>
              <th className="hidden md:table-cell">Admit Date</th>
              <th className="hidden md:table-cell">Discharge</th>
              <th className="hidden lg:table-cell">Location</th>
              <th className="hidden lg:table-cell">Facility</th>
              <th>Events</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="dash-table-empty">No patients found</td>
              </tr>
            ) : (
              paginated.map((p) => {
                const location = formatLocation(p.latestLocation);
                const lastClass = p.events[p.events.length - 1]?.patientClass;
                const classLabel = lastClass ? PATIENT_CLASS_LABELS[lastClass] || lastClass : '';

                return (
                  <tr
                    key={p.mrn}
                    onClick={() => onSelectPatient(p.mrn)}
                    className="dash-table-row"
                  >
                    <td>
                      <div className="dash-table-patient">
                        <span className="dash-table-name">
                          {p.name.last}, {p.name.first}
                        </span>
                        {classLabel && (
                          <span className="dash-table-class">{classLabel}</span>
                        )}
                      </div>
                    </td>
                    <td className="dash-table-mono">{p.mrn}</td>
                    <td>
                      <span className={`dash-badge ${getStatusClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      {p.admissionDate ? formatDateOnly(p.admissionDate) : '—'}
                    </td>
                    <td className="hidden md:table-cell">
                      {p.dischargeDate ? formatDateOnly(p.dischargeDate) : '—'}
                    </td>
                    <td className="hidden lg:table-cell">{location || '—'}</td>
                    <td className="hidden lg:table-cell">{getFacilityLabel(p.facility)}</td>
                    <td className="dash-table-events">{p.events.length}</td>
                    <td>
                      <ExternalLink className="h-3.5 w-3.5 dash-table-link" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="dash-pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="dash-page-btn"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="dash-page-info">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="dash-page-btn"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
