'use client';

import { TimelineEvent } from '@/lib/types';
import { formatDateTime } from '@/lib/date-utils';
import { formatLocation } from '@/lib/timeline-builder';
import { getMessageTypeMeta, PATIENT_CLASS_LABELS } from '@/lib/hl7-constants';
import { Badge } from '@/components/ui/Badge';
import { X, Clock, Stethoscope, MapPin, FileText, DollarSign, Activity, Hash, LogIn, LogOut } from 'lucide-react';

interface EventDetailPanelProps {
  event: TimelineEvent;
  onClose: () => void;
}

export function EventDetailPanel({ event, onClose }: EventDetailPanelProps) {
  const meta = getMessageTypeMeta(event.messageType);
  const location = formatLocation(event.location);
  const patientClassLabel =
    PATIENT_CLASS_LABELS[event.patientClass] || event.patientClass;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-slide-up">
      {/* Header with accent */}
      <div className={`${meta.bgColor} border-b ${meta.borderColor} px-3.5 sm:px-5 py-3 sm:py-4`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${meta.dotColor}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge
                  label={event.label}
                  color={meta.color}
                  bgColor="bg-white/60"
                  borderColor={meta.borderColor}
                  size="md"
                />
                <span className="text-[10px] sm:text-xs text-gray-500 font-mono">
                  {event.messageType}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-600 transition-all active:scale-90 touch-target shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-3.5 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <DetailItem
            icon={<Clock className="h-4 w-4 text-blue-500" />}
            label="Date & Time"
            value={formatDateTime(event.dateTime)}
          />

          {event.attendingDoctor && (
            <DetailItem
              icon={<Stethoscope className="h-4 w-4 text-blue-500" />}
              label="Attending Physician"
              value={event.attendingDoctor}
            />
          )}

          {event.admittingPhysician && (
            <DetailItem
              icon={<LogIn className="h-4 w-4 text-emerald-500" />}
              label="Admitting Physician"
              value={event.admittingPhysician}
            />
          )}

          {event.dischargingPhysician && (
            <DetailItem
              icon={<LogOut className="h-4 w-4 text-red-500" />}
              label="Discharging Physician"
              value={event.dischargingPhysician}
            />
          )}

          {location && (
            <DetailItem
              icon={<MapPin className="h-4 w-4 text-amber-500" />}
              label="Location"
              value={location}
            />
          )}

          {patientClassLabel && (
            <DetailItem
              icon={<Activity className="h-4 w-4 text-purple-500" />}
              label="Patient Class"
              value={patientClassLabel}
            />
          )}

          {event.totalCharges != null && event.totalCharges > 0 && (
            <DetailItem
              icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
              label="Total Charges"
              value={`$${event.totalCharges.toLocaleString()}`}
            />
          )}

          {event.admitReason && (
            <DetailItem
              icon={<FileText className="h-4 w-4 text-gray-500" />}
              label="Admit Reason"
              value={event.admitReason}
              fullWidth
            />
          )}
        </div>

        {event.diagnoses && event.diagnoses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Diagnoses
            </h4>
            <div className="space-y-1.5">
              {event.diagnoses.map((dx, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  {dx.code && (
                    <span className="font-mono text-[11px] text-gray-400 bg-gray-200/60 rounded px-1.5 py-0.5 shrink-0">
                      {dx.code}
                    </span>
                  )}
                  <span className="text-[13px]">{dx.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Hash className="h-3 w-3" />
          <span className="font-mono">{event.id}</span>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex items-start gap-2 sm:gap-2.5 bg-gray-50/80 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-3 ${fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs sm:text-[13px] font-medium text-gray-700 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}
