'use client';

import { useState, useMemo } from 'react';
import { TimelineEvent, PatientRecord } from '@/lib/types';
import { formatDateTime, formatDateOnly } from '@/lib/date-utils';
import { getMessageTypeMeta } from '@/lib/hl7-constants';
import { getPositionPercent } from '@/lib/timeline-builder';
import { startOfMonth, addMonths, isBefore, startOfWeek, addWeeks, format } from 'date-fns';

interface HorizontalTimelineProps {
  events: TimelineEvent[];
  admissionDate?: Date;
  dischargeDate?: Date;
  status: PatientRecord['status'];
  onEventClick: (event: TimelineEvent) => void;
  selectedEventId: string | null;
}

const LINE_Y = 50;
const DOT_R = 5;
const PAD = 40;
const SVG_HEIGHT = 100;

/** Calendar ticks: month starts between start and end, plus start/end for bands */
function getCalendarTicks(start: Date, end: Date): { months: Date[]; weeks: Date[] } {
  const months: Date[] = [];
  const weeks: Date[] = [];
  const rangeMs = end.getTime() - start.getTime();
  const rangeDays = rangeMs / (24 * 60 * 60 * 1000);

  let d = startOfMonth(start);
  if (d.getTime() < start.getTime()) d = addMonths(d, 1);
  while (isBefore(d, end) || d.getTime() === end.getTime()) {
    months.push(new Date(d));
    d = addMonths(d, 1);
  }

  if (rangeDays <= 60) {
    let w = startOfWeek(start, { weekStartsOn: 1 });
    if (w.getTime() < start.getTime()) w = addWeeks(w, 1);
    while (isBefore(w, end)) {
      weeks.push(new Date(w));
      w = addWeeks(w, 1);
    }
  }

  return { months, weeks };
}

export function HorizontalTimeline({
  events,
  admissionDate,
  dischargeDate,
  status,
  onEventClick,
  selectedEventId,
}: HorizontalTimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (events.length === 0 && !admissionDate) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">No events to display</div>
    );
  }

  // Determine time range: anchor to admission/discharge if available
  const startTime = admissionDate ?? events[0]?.dateTime ?? new Date();
  const endTime = dischargeDate ?? events[events.length - 1]?.dateTime ?? startTime;
  const minWidth = Math.max(600, events.length * 28 + PAD * 2);

  // Position events
  const positioned = events.map((event) => {
    const pct = getPositionPercent(event.dateTime, startTime, endTime);
    const x = PAD + (pct / 100) * (minWidth - PAD * 2);
    return { event, x };
  });

  // Avoid dot overlaps
  for (let i = 1; i < positioned.length; i++) {
    const minGap = DOT_R * 2.8;
    if (positioned[i].x - positioned[i - 1].x < minGap) {
      positioned[i].x = positioned[i - 1].x + minGap;
    }
  }

  const totalWidth = Math.max(
    minWidth,
    (positioned[positioned.length - 1]?.x ?? 0) + PAD
  );

  const trackWidth = totalWidth - PAD * 2;
  const { months, weeks } = useMemo(
    () => getCalendarTicks(startTime, endTime),
    [startTime.getTime(), endTime.getTime()]
  );

  const toX = (d: Date) => PAD + (getPositionPercent(d, startTime, endTime) / 100) * trackWidth;
  const bandPairs: { x1: number; x2: number; even: boolean }[] = useMemo(() => {
    const all = [startTime, ...months, endTime].filter((a, i, arr) => {
      const t = a.getTime();
      return t >= startTime.getTime() && t <= endTime.getTime() && (i === 0 || t !== arr[i - 1]?.getTime());
    });
    const out: { x1: number; x2: number; even: boolean }[] = [];
    for (let i = 0; i < all.length - 1; i++) {
      out.push({
        x1: PAD + (getPositionPercent(all[i], startTime, endTime) / 100) * trackWidth,
        x2: PAD + (getPositionPercent(all[i + 1], startTime, endTime) / 100) * trackWidth,
        even: i % 2 === 0,
      });
    }
    return out;
  }, [startTime, endTime, months, trackWidth]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${totalWidth} ${SVG_HEIGHT}`}
          className="block"
        >
          {/* Calendar background: alternating month bands */}
          {bandPairs.map((band, i) => (
            <rect
              key={i}
              x={band.x1}
              y={0}
              width={Math.max(0, band.x2 - band.x1)}
              height={SVG_HEIGHT}
              fill={band.even ? '#f8fafc' : '#ffffff'}
            />
          ))}
          {/* Week grid (light vertical lines when range ≤ 60 days) */}
          {weeks.map((d, i) => (
            <line
              key={`w-${i}`}
              x1={toX(d)}
              y1={0}
              x2={toX(d)}
              y2={SVG_HEIGHT}
              stroke="#e2e8f0"
              strokeWidth={0.5}
              strokeDasharray="2 2"
            />
          ))}
          {/* Month boundary lines */}
          {months.map((d, i) => (
            <line
              key={`m-${i}`}
              x1={toX(d)}
              y1={0}
              x2={toX(d)}
              y2={SVG_HEIGHT}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          ))}
          {/* Month labels */}
          {months.map((d, i) => {
            const x = toX(d);
            if (x < PAD + 24 || x > totalWidth - PAD - 24) return null;
            return (
              <text
                key={`l-${i}`}
                x={x}
                y={SVG_HEIGHT - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize={9}
                fontWeight={500}
              >
                {format(d, 'MMM yyyy')}
              </text>
            );
          })}

          {/* Main line */}
          <line x1={PAD} y1={LINE_Y} x2={totalWidth - PAD} y2={LINE_Y}
            stroke="#e2e8f0" strokeWidth={1.5} strokeLinecap="round"
          />

          {/* Colored segments */}
          {positioned.map((pos, i) => {
            if (i === 0) return null;
            const prevMeta = getMessageTypeMeta(positioned[i - 1].event.messageType);
            return (
              <line key={`s-${i}`}
                x1={positioned[i - 1].x} y1={LINE_Y} x2={pos.x} y2={LINE_Y}
                stroke={prevMeta.hex} strokeWidth={1.5} opacity={0.35}
              />
            );
          })}

          {/* ── Admission anchor (left) ── */}
          <circle cx={PAD} cy={LINE_Y} r={7} fill="#10b981" stroke="white" strokeWidth={2.5} />
          <text x={PAD} y={LINE_Y - 14} textAnchor="middle" fill="#10b981" fontSize={8} fontWeight={700}>ADMIT</text>
          <text x={PAD} y={SVG_HEIGHT - 6} textAnchor="start" fill="#10b981" fontSize={8} fontWeight={600}>
            {formatDateOnly(startTime)}
          </text>

          {/* ── Discharge anchor (right) ── */}
          {dischargeDate ? (
            <>
              <circle cx={totalWidth - PAD} cy={LINE_Y} r={7} fill="#ef4444" stroke="white" strokeWidth={2.5} />
              <text x={totalWidth - PAD} y={LINE_Y - 14} textAnchor="middle" fill="#ef4444" fontSize={8} fontWeight={700}>DISCHARGE</text>
              <text x={totalWidth - PAD} y={SVG_HEIGHT - 6} textAnchor="end" fill="#ef4444" fontSize={8} fontWeight={600}>
                {formatDateOnly(dischargeDate)}
              </text>
            </>
          ) : (
            <>
              <polyline
                points={`${totalWidth - PAD - 5},${LINE_Y - 4} ${totalWidth - PAD},${LINE_Y} ${totalWidth - PAD - 5},${LINE_Y + 4}`}
                fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              />
              <text x={totalWidth - PAD} y={SVG_HEIGHT - 6} textAnchor="end" fill="#3b82f6" fontSize={8} fontWeight={600}>
                {status === 'admitted' ? 'Still Admitted' : 'Ongoing'}
              </text>
            </>
          )}

          {/* ── Event dots ── */}
          {positioned.map(({ event, x }) => {
            const meta = getMessageTypeMeta(event.messageType);
            const active = hoveredId === event.id || selectedEventId === event.id;

            return (
              <g key={event.id} className="cursor-pointer"
                onClick={() => onEventClick(event)}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {active && (
                  <circle cx={x} cy={LINE_Y} r={DOT_R + 4} fill="none" stroke={meta.hex} strokeWidth={1.5} opacity={0.3} />
                )}
                <circle cx={x} cy={LINE_Y} r={active ? DOT_R + 1 : DOT_R} fill={meta.hex} stroke="white" strokeWidth={2} />

                {hoveredId === event.id && (
                  <foreignObject x={x - 100} y={LINE_Y - 80} width={200} height={62}>
                    <div className="bg-gray-900 text-white text-[11px] rounded-lg p-2 shadow-xl text-center">
                      <div className="font-semibold">{event.label}</div>
                      <div className="text-gray-400">{formatDateTime(event.dateTime)}</div>
                      {event.doctor && <div className="text-gray-400 truncate">{event.doctor}</div>}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-100 px-3 py-2 flex flex-wrap gap-3 text-[10px]">
        {[
          { label: 'Admission', color: '#22c55e' },
          { label: 'Discharge', color: '#ef4444' },
          { label: 'Update', color: '#3b82f6' },
          { label: 'Transfer', color: '#f59e0b' },
          { label: 'Cancel', color: '#6b7280' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1 text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
