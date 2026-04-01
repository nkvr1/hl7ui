'use client';

import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PatientRecord } from '@/lib/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface AdmissionChartProps {
  patients: PatientRecord[];
}

interface DayData {
  date: string;
  displayDate: string;
  OP: number;
  IP: number;
  Emergency: number;
  Other: number;
  total: number;
}

const CLASS_MAP: Record<string, keyof Pick<DayData, 'OP' | 'IP' | 'Emergency' | 'Other'>> = {
  O: 'OP',
  I: 'IP',
  E: 'Emergency',
};

function getLineColors(theme: string) {
  if (theme === 'dark') {
    return { OP: '#5b8af5', IP: '#f55b7a', Emergency: '#5bf5a0', Other: '#f5d55b' };
  }
  return { OP: '#3b82f6', IP: '#ef4444', Emergency: '#22c55e', Other: '#f59e0b' };
}

export function AdmissionChart({ patients }: AdmissionChartProps) {
  const { theme } = useTheme();
  const colors = getLineColors(theme);

  const chartData = useMemo(() => {
    const dayMap = new Map<string, DayData>();

    patients.forEach((patient) => {
      patient.events.forEach((event) => {
        if (event.category !== 'admission' && event.category !== 'transfer') return;

        const dateStr = format(event.dateTime, 'yyyy-MM-dd');
        const existing = dayMap.get(dateStr) || {
          date: dateStr,
          displayDate: format(event.dateTime, 'MMM dd'),
          OP: 0,
          IP: 0,
          Emergency: 0,
          Other: 0,
          total: 0,
        };

        const key = CLASS_MAP[event.patientClass] || 'Other';
        existing[key]++;
        existing.total++;
        dayMap.set(dateStr, existing);
      });
    });

    // If no admission events, count all events per day by patientClass
    if (dayMap.size === 0) {
      patients.forEach((patient) => {
        patient.events.forEach((event) => {
          const dateStr = format(event.dateTime, 'yyyy-MM-dd');
          const existing = dayMap.get(dateStr) || {
            date: dateStr,
            displayDate: format(event.dateTime, 'MMM dd'),
            OP: 0,
            IP: 0,
            Emergency: 0,
            Other: 0,
            total: 0,
          };

          const key = CLASS_MAP[event.patientClass] || 'Other';
          existing[key]++;
          existing.total++;
          dayMap.set(dateStr, existing);
        });
      });
    }

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [patients]);

  if (chartData.length === 0) {
    return (
      <div className="dash-card dash-chart-empty">
        <p>No data available for the selected date range</p>
      </div>
    );
  }

  const gridColor = theme === 'dark' ? '#1a2440' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#556688' : '#64748b';

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Admission Trends</h3>
        <div className="dash-chart-legend">
          {Object.entries(colors).map(([key, color]) => (
            <span key={key} className="dash-legend-item">
              <span className="dash-legend-dot" style={{ backgroundColor: color }} />
              {key}
            </span>
          ))}
        </div>
      </div>
      <div className="dash-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              stroke={textColor}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#151d35' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#2a3555' : '#e2e8f0'}`,
                borderRadius: '10px',
                color: theme === 'dark' ? '#e0e8f5' : '#0f172a',
                fontSize: '12px',
                padding: '8px 12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="OP"
              stroke={colors.OP}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.OP }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="IP"
              stroke={colors.IP}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.IP }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Emergency"
              stroke={colors.Emergency}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.Emergency }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Other"
              stroke={colors.Other}
              strokeWidth={2.5}
              dot={{ r: 3, fill: colors.Other }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
