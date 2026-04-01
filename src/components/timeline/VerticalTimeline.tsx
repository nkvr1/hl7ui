'use client';

import { useState } from 'react';
import {
  TimelineItem,
  TimelineEvent,
  CollapsedGroup,
  isCollapsedGroup,
  PatientRecord,
} from '@/lib/types';
import { formatDateTime, formatTimeOnly, formatDateOnly, formatDateOnlyShort } from '@/lib/date-utils';
import { getMessageTypeMeta, PATIENT_CLASS_LABELS } from '@/lib/hl7-constants';
import { formatLocation, detectLocationChanges } from '@/lib/timeline-builder';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  MapPin,
  Stethoscope,
  DollarSign,
  LogIn,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';

interface VerticalTimelineProps {
  items: TimelineItem[];
  events: TimelineEvent[];
  admissionDate?: Date;
  dischargeDate?: Date;
  status: PatientRecord['status'];
  onEventClick: (event: TimelineEvent) => void;
  selectedEventId: string | null;
}

export function VerticalTimeline({
  items,
  events,
  admissionDate,
  dischargeDate,
  status,
  onEventClick,
  selectedEventId,
}: VerticalTimelineProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const locationChanges = detectLocationChanges(events);

  const toggleGroup = (index: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="relative pl-5 sm:pl-7">
      {/* Vertical line */}
      <div className="absolute left-[10px] sm:left-[14px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-gray-200 to-gray-100" />

      {/* ── Admission anchor ── */}
      {admissionDate && (
        <div className="relative pb-2 sm:pb-3">
          <div className="absolute -left-[14px] sm:-left-[18px] top-2">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 ring-[3px] sm:ring-4 ring-emerald-500/15 flex items-center justify-center">
              <LogIn className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700">ADMISSION</span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-medium">{formatDateOnly(admissionDate)}</span>
          </div>
        </div>
      )}

      {/* ── Events grouped by date ── */}
      {items.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">No events</div>
      ) : (
        <div>
          {(() => {
            let lastDateStr = '';
            return items.map((item, index) => {
              const itemDate = isCollapsedGroup(item)
                ? formatDateOnly(item.startTime)
                : formatDateOnly(item.dateTime);
              const showDateHeader = itemDate !== lastDateStr;
              lastDateStr = itemDate;

              return (
                <div key={isCollapsedGroup(item) ? `group-${index}` : item.id}>
                  {/* Date separator */}
                  {showDateHeader && (
                    <div className="relative pb-1.5 sm:pb-2 pt-1">
                      <div className="absolute -left-[13px] sm:-left-[17px] top-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300 ring-[3px] ring-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded-md px-2 py-0.5">
                          {itemDate}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    </div>
                  )}
                  {isCollapsedGroup(item) ? (
                    <CollapsedGroupNode
                      group={item}
                      isExpanded={expandedGroups.has(index)}
                      onToggle={() => toggleGroup(index)}
                      onEventClick={onEventClick}
                      selectedEventId={selectedEventId}
                      locationChanges={locationChanges}
                    />
                  ) : (
                    <EventNode
                      event={item}
                      locationChange={locationChanges.get(item.id)}
                      onClick={() => onEventClick(item)}
                      isSelected={selectedEventId === item.id}
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ── Discharge anchor ── */}
      {dischargeDate ? (
        <div className="relative pt-1">
          <div className="absolute -left-[14px] sm:-left-[18px] top-3">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-500 ring-[3px] sm:ring-4 ring-red-500/15 flex items-center justify-center">
              <LogOut className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <span className="text-[10px] sm:text-xs font-bold text-red-700">DISCHARGED</span>
            <span className="text-[10px] sm:text-xs text-red-600 font-medium">{formatDateOnly(dischargeDate)}</span>
          </div>
        </div>
      ) : status === 'admitted' ? (
        <div className="relative pt-1">
          <div className="absolute -left-[14px] sm:-left-[18px] top-3">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 ring-[3px] sm:ring-4 ring-blue-500/15 flex items-center justify-center">
              <MoreHorizontal className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
            <span className="text-[10px] sm:text-xs font-bold text-blue-700">STILL ADMITTED</span>
            <span className="text-[10px] sm:text-xs text-blue-500 font-medium">In progress</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Single event card ── */
function EventNode({
  event,
  locationChange,
  onClick,
  isSelected,
}: {
  event: TimelineEvent;
  locationChange?: { from: string; to: string };
  onClick: () => void;
  isSelected: boolean;
}) {
  const meta = getMessageTypeMeta(event.messageType);
  const location = formatLocation(event.location);
  const patientClassLabel = PATIENT_CLASS_LABELS[event.patientClass] || '';

  const hasPhysicians = event.attendingDoctor || event.admittingPhysician || event.dischargingPhysician;
  const hasDates = event.visitAdmitDate || event.visitDischargeDate;

  return (
    <div className="relative pb-1.5 sm:pb-2 last:pb-2">
      <div className="absolute -left-[13px] sm:-left-[17px] top-3">
        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${meta.dotColor} ring-[3px] ring-white shadow-sm ${isSelected ? 'animate-pulse-dot' : ''}`} />
      </div>
      <button
        onClick={onClick}
        className={`
          group w-full text-left rounded-lg border px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-200
          ${isSelected
            ? `${meta.borderColor} ${meta.bgColor} shadow-md ring-2 ring-offset-1 ring-blue-200`
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:scale-[0.995]'
          }
        `}
      >
        {/* Row 1: Badge + Class + Time */}
        <div className="flex items-center justify-between mb-1 sm:mb-1.5 gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Badge label={event.label} color={meta.color} bgColor={meta.bgColor} borderColor={meta.borderColor} />
            {patientClassLabel && <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium hidden sm:inline">{patientClassLabel}</span>}
          </div>
          <span className="text-[9px] sm:text-[11px] text-gray-400 font-mono tabular-nums font-medium shrink-0">
            {formatDateTime(event.dateTime)}
          </span>
        </div>

        {/* Row 2: Physicians - stack on mobile, grid on tablet+ */}
        {hasPhysicians && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mt-1">
            <PhysicianPill
              icon={<Stethoscope className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />}
              role="Attending"
              name={event.attendingDoctor}
              color="blue"
            />
            <PhysicianPill
              icon={<LogIn className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500" />}
              role="Admitting"
              name={event.admittingPhysician}
              color="emerald"
            />
            <PhysicianPill
              icon={<LogOut className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />}
              role="Discharging"
              name={event.dischargingPhysician}
              color="red"
            />
          </div>
        )}

        {/* Row 3: Dates + Location + Charges */}
        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 mt-1 sm:mt-1.5 text-[10px] sm:text-[11px]">
          {event.visitAdmitDate && (
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-gray-400">Admit:</span>
              <span className="font-medium">{formatDateOnlyShort(event.visitAdmitDate)}</span>
            </span>
          )}
          {event.visitDischargeDate && (
            <span className="flex items-center gap-1 text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-gray-400">Disch:</span>
              <span className="font-medium">{formatDateOnlyShort(event.visitDischargeDate)}</span>
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="font-medium">{location}</span>
            </span>
          )}
          {event.totalCharges != null && event.totalCharges > 0 && (
            <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
              <DollarSign className="h-3 w-3" />
              {event.totalCharges.toLocaleString()}
            </span>
          )}
        </div>

        {/* Row 4: Location change */}
        {locationChange && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 font-medium">
            <ArrowRight className="h-3 w-3" />
            {locationChange.from || 'Unknown'} <span className="text-amber-400">→</span> {locationChange.to}
          </div>
        )}
      </button>
    </div>
  );
}

/* ── Physician pill ── */
function PhysicianPill({
  icon,
  role,
  name,
  color,
}: {
  icon: React.ReactNode;
  role: string;
  name?: string;
  color: string;
}) {
  if (!name) return null;

  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    red: 'bg-red-50 border-red-100',
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 rounded-md border px-1.5 sm:px-2 py-0.5 sm:py-1 ${bgMap[color] || 'bg-gray-50 border-gray-100'}`}>
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">{role}</p>
        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-700 truncate leading-tight mt-0.5">{name}</p>
      </div>
    </div>
  );
}

/* ── Collapsed group ── */
function CollapsedGroupNode({
  group,
  isExpanded,
  onToggle,
  onEventClick,
  selectedEventId,
  locationChanges,
}: {
  group: CollapsedGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onEventClick: (event: TimelineEvent) => void;
  selectedEventId: string | null;
  locationChanges: Map<string, { from: string; to: string }>;
}) {
  const meta = getMessageTypeMeta(group.events[0]?.messageType || 'ADT^A08');

  return (
    <div className="relative pb-1.5 sm:pb-2 last:pb-2">
      <div className="absolute -left-[13px] sm:-left-[17px] top-3">
        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${meta.dotColor} opacity-40 ring-[3px] ring-white`} />
      </div>
      <button
        onClick={onToggle}
        className="group w-full text-left rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-2.5 sm:px-3 py-1.5 sm:py-2
          hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.998]"
      >
        <div className="flex items-center gap-2.5">
          <div className="text-gray-400 transition-transform duration-200">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
          </div>
          <Badge label={group.label} color={meta.color} bgColor={meta.bgColor} borderColor={meta.borderColor} />
          <span className="text-[11px] text-gray-400 font-mono tabular-nums">
            {formatTimeOnly(group.startTime)} — {formatTimeOnly(group.endTime)}
          </span>
        </div>
      </button>
      {isExpanded && (
        <div className="mt-1.5 ml-4 space-y-1 border-l-2 border-gray-100 pl-3 animate-fade-in-down">
          {group.events.map((event) => (
            <EventNode
              key={event.id}
              event={event}
              locationChange={locationChanges.get(event.id)}
              onClick={() => onEventClick(event)}
              isSelected={selectedEventId === event.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
