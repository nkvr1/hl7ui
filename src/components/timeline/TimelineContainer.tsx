'use client';

import { useState, useMemo } from 'react';
import { PatientRecord, TimelineEventCategory, TimelineEvent } from '@/lib/types';
import { buildTimelineItems, filterEventsByCategory } from '@/lib/timeline-builder';
import { VerticalTimeline } from './VerticalTimeline';
import { HorizontalTimeline } from './HorizontalTimeline';
import { TimelineFilters } from './TimelineFilters';
import { EventDetailPanel } from './EventDetailPanel';
import { PatientSummaryCard } from '@/components/patient/PatientSummaryCard';
import { LayoutToggle } from '@/components/ui/Toggle';
import { useTimelineLayout } from '@/hooks/useTimelineLayout';
import { Stethoscope, Filter } from 'lucide-react';

interface TimelineContainerProps {
  patient: PatientRecord;
}

export function TimelineContainer({ patient }: TimelineContainerProps) {
  const { layout, toggleLayout } = useTimelineLayout();
  const [activeCategories, setActiveCategories] = useState<TimelineEventCategory[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const handleToggleCategory = (category: TimelineEventCategory) => {
    setActiveCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };

  const filteredEvents = useMemo(() => {
    let events = filterEventsByCategory(patient.events, activeCategories);
    if (selectedDoctor) {
      events = events.filter((e) => e.doctor === selectedDoctor);
    }
    return events;
  }, [patient.events, activeCategories, selectedDoctor]);

  const timelineItems = useMemo(
    () => buildTimelineItems(filteredEvents),
    [filteredEvents]
  );

  const hasActiveFilters = activeCategories.length > 0 || !!selectedDoctor;

  return (
    <div className="space-y-2 sm:space-y-2.5">
      <PatientSummaryCard patient={patient} />

      {/* Filters toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-2.5 sm:px-3 py-2 sm:py-2.5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between gap-2">
          {/* Left: filters + doctor select - scrollable on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-x-auto no-scrollbar flex-1">
            <TimelineFilters
              activeCategories={activeCategories}
              onToggleCategory={handleToggleCategory}
            />
            {patient.doctors.length > 1 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="hidden sm:block h-4 w-px bg-gray-200" />
                <div className="relative">
                  <Stethoscope className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400" />
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="text-[10px] sm:text-[11px] font-semibold border border-gray-200 rounded-lg pl-6 sm:pl-7 pr-5 sm:pr-6 py-1 sm:py-1.5 bg-white text-gray-700
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="">All Doctors</option>
                    {patient.doctors.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Right: count + layout toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hasActiveFilters && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                <Filter className="h-3 w-3" />
                {filteredEvents.length} of {patient.events.length}
              </span>
            )}
            <LayoutToggle layout={layout} onToggle={toggleLayout} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {layout === 'vertical' ? (
          <VerticalTimeline
            items={timelineItems}
            events={filteredEvents}
            admissionDate={patient.admissionDate}
            dischargeDate={patient.dischargeDate}
            status={patient.status}
            onEventClick={setSelectedEvent}
            selectedEventId={selectedEvent?.id ?? null}
          />
        ) : (
          <HorizontalTimeline
            events={filteredEvents}
            admissionDate={patient.admissionDate}
            dischargeDate={patient.dischargeDate}
            status={patient.status}
            onEventClick={setSelectedEvent}
            selectedEventId={selectedEvent?.id ?? null}
          />
        )}
      </div>

      {selectedEvent && (
        <EventDetailPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
