'use client';

import { PatientRecord } from '@/lib/types';
import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  patients: PatientRecord[];
}

export function StatsCards({ patients }: StatsCardsProps) {
  const admitted = patients.filter((p) => p.status === 'admitted').length;
  const discharged = patients.filter((p) => p.status === 'discharged').length;
  const emergency = patients.filter((p) =>
    p.events.some((e) => e.patientClass === 'E')
  ).length;

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'accent' },
    { label: 'Admitted', value: admitted, icon: UserCheck, color: 'admitted' },
    { label: 'Discharged', value: discharged, icon: UserX, color: 'discharged' },
    { label: 'Emergency', value: emergency, icon: AlertTriangle, color: 'emergency' },
  ];

  return (
    <div className="dash-stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="dash-stat-card">
          <div className={`dash-stat-icon dash-stat-${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="dash-stat-value">{stat.value.toLocaleString()}</p>
            <p className="dash-stat-label">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
