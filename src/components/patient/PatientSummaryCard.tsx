'use client';

import { PatientRecord } from '@/lib/types';
import { formatDateOnly, formatDuration } from '@/lib/date-utils';
import { formatLocation } from '@/lib/timeline-builder';
import { PATIENT_CLASS_LABELS } from '@/lib/hl7-constants';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Activity,
  Stethoscope,
} from 'lucide-react';

interface PatientSummaryCardProps {
  patient: PatientRecord;
}

const STATUS_STYLES: Record<
  PatientRecord['status'],
  { color: string; bgColor: string; borderColor: string; label: string; gradient: string }
> = {
  admitted: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Admitted',
    gradient: 'from-emerald-500 to-green-600',
  },
  discharged: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Discharged',
    gradient: 'from-red-500 to-rose-600',
  },
  cancelled: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    label: 'Cancelled',
    gradient: 'from-gray-400 to-gray-500',
  },
  unknown: {
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    label: 'Unknown',
    gradient: 'from-slate-400 to-slate-500',
  },
};

export function PatientSummaryCard({ patient }: PatientSummaryCardProps) {
  const statusStyle = STATUS_STYLES[patient.status];
  const location = formatLocation(patient.latestLocation);
  const lastEvent = patient.events[patient.events.length - 1];
  const patientClassLabel =
    lastEvent ? PATIENT_CLASS_LABELS[lastEvent.patientClass] || lastEvent.patientClass : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up">
      {/* Top gradient accent */}
      <div className={`h-0.5 bg-gradient-to-r ${statusStyle.gradient}`} />

      <div className="px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-gray-900 tracking-tight truncate">
                {patient.name.last}, {patient.name.first}
                {patient.name.middle ? ` ${patient.name.middle}` : ''}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-xs text-gray-400 flex-wrap">
                <span className="font-mono font-medium text-gray-500">{patient.mrn}</span>
                {patient.sex && (
                  <>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex}</span>
                  </>
                )}
                {patient.facility && (
                  <>
                    <span>·</span>
                    <span>Facility {patient.facility}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge
            label={statusStyle.label}
            color={statusStyle.color}
            bgColor={statusStyle.bgColor}
            borderColor={statusStyle.borderColor}
            size="md"
          />
        </div>

        {/* Stats grid - 2 cols on mobile, up to 5 on desktop */}
        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-1.5">
          {patient.admissionDate && (
            <StatItem
              icon={<Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />}
              label="Admitted"
              value={formatDateOnly(patient.admissionDate)}
            />
          )}

          {patient.dischargeDate && (
            <StatItem
              icon={<Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />}
              label="Discharged"
              value={formatDateOnly(patient.dischargeDate)}
            />
          )}

          {patient.admissionDate && patient.dischargeDate && (
            <StatItem
              icon={<Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />}
              label="Length of Stay"
              value={formatDuration(patient.admissionDate, patient.dischargeDate)}
            />
          )}

          {location && (
            <StatItem
              icon={<MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />}
              label="Location"
              value={location}
            />
          )}

          <StatItem
            icon={<Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-500" />}
            label="Events"
            value={`${patient.events.length}${patientClassLabel ? ` · ${patientClassLabel}` : ''}`}
          />
        </div>

        {/* Doctors - horizontal scroll on mobile */}
        {patient.doctors.length > 0 && (
          <div className="mt-2.5 sm:mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Stethoscope className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <div className="flex gap-1.5 flex-nowrap sm:flex-wrap">
              {patient.doctors.map((doc) => (
                <span
                  key={doc}
                  className="text-[10px] sm:text-[11px] font-medium text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 whitespace-nowrap shrink-0"
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5 sm:gap-2 bg-gray-50/80 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
