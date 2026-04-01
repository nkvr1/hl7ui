import { PatientRecord } from './types';
import { formatDateOnly } from './date-utils';

export interface DoctorSummary {
  name: string;
  patientCount: number;
  eventCount: number;
  dates: string[]; // unique dates (formatted)
}

export interface DoctorDayPatient {
  mrn: string;
  displayName: string;
  status: PatientRecord['status'];
  admissionDate?: Date;
  dischargeDate?: Date;
  eventCount: number;
  events: {
    label: string;
    dateTime: Date;
    messageType: string;
    location: string;
    charges?: number;
  }[];
}

/**
 * Extract all unique doctors from patient records.
 */
export function extractDoctors(patients: PatientRecord[]): DoctorSummary[] {
  const doctorMap = new Map<string, { patients: Set<string>; events: number; dates: Set<string> }>();

  for (const patient of patients) {
    for (const event of patient.events) {
      if (!event.doctor) continue;
      if (!doctorMap.has(event.doctor)) {
        doctorMap.set(event.doctor, { patients: new Set(), events: 0, dates: new Set() });
      }
      const doc = doctorMap.get(event.doctor)!;
      doc.patients.add(patient.mrn);
      doc.events++;
      doc.dates.add(formatDateOnly(event.dateTime));
    }
  }

  return Array.from(doctorMap.entries())
    .map(([name, data]) => ({
      name,
      patientCount: data.patients.size,
      eventCount: data.events,
      dates: Array.from(data.dates).sort(),
    }))
    .sort((a, b) => b.patientCount - a.patientCount);
}

/**
 * Get unique dates for a specific doctor.
 */
export function getDoctorDates(patients: PatientRecord[], doctorName: string): string[] {
  const dates = new Set<string>();
  for (const patient of patients) {
    for (const event of patient.events) {
      if (event.doctor === doctorName) {
        dates.add(formatDateOnly(event.dateTime));
      }
    }
  }
  return Array.from(dates).sort().reverse();
}

/**
 * Get all patients a doctor saw on a specific date.
 */
export function getDoctorPatientsForDate(
  patients: PatientRecord[],
  doctorName: string,
  dateStr: string
): DoctorDayPatient[] {
  const results: DoctorDayPatient[] = [];

  for (const patient of patients) {
    const dayEvents = patient.events.filter((e) => {
      if (e.doctor !== doctorName) return false;
      return formatDateOnly(e.dateTime) === dateStr;
    });

    if (dayEvents.length === 0) continue;

    results.push({
      mrn: patient.mrn,
      displayName: `${patient.name.last}, ${patient.name.first}`.trim() || patient.mrn,
      status: patient.status,
      admissionDate: patient.admissionDate,
      dischargeDate: patient.dischargeDate,
      eventCount: dayEvents.length,
      events: dayEvents.map((e) => ({
        label: e.label,
        dateTime: e.dateTime,
        messageType: e.messageType,
        location: [e.location.unit, e.location.room ? `Rm ${e.location.room}` : '', e.location.bed ? `Bed ${e.location.bed}` : ''].filter(Boolean).join(' '),
        charges: e.totalCharges,
      })),
    });
  }

  return results.sort((a, b) => b.eventCount - a.eventCount);
}
