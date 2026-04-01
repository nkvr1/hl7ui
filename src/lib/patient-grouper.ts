import {
  RawRecord,
  TimelineEvent,
  PatientRecord,
  PatientSummary,
} from './types';
import { extractMrn, transformAllRecords } from './parser';
import { parseHL7DateTime } from './date-utils';

/**
 * Clean MRN by stripping HL7 suffixes like ^^^012^MR
 */
function cleanMrn(rawMrn: string): string {
  return rawMrn.split('^^^')[0].trim();
}

/**
 * Group raw records by patient MRN and build PatientRecords.
 *
 * Aligns with backend logic:
 * - visit.admitDateTime = encounter admission date (present on all messages)
 * - visit.dischargeDateTime = encounter discharge date (on A03 messages)
 * - recordedDateTime/timestamp = when the HL7 message was recorded (event time)
 * - ADT^A04 = Registration (creates admission)
 * - ADT^A03 = Discharge
 * - ADT^A08 = Patient Update / Charge Capture
 * - ADT^A06/A07 = Transfer
 * - ADT^A11 = Cancel Admit
 * - MDM^T04 = Document (skipped by backend)
 */
export function groupByPatient(records: RawRecord[]): PatientRecord[] {
  const events = transformAllRecords(records);

  // Build a lookup from messageControlId to event
  const eventById = new Map<string, TimelineEvent>();
  for (const e of events) {
    eventById.set(e.id, e);
  }

  // Group by MRN
  const groupMap = new Map<
    string,
    { events: TimelineEvent[]; records: RawRecord[] }
  >();

  for (const record of records) {
    const mrn = extractMrn(record.transformed);
    if (!mrn) continue;

    const eventId =
      record.transformed.messageControlId ||
      `${mrn}-${parseHL7DateTime(record.transformed.recordedDateTime || record.transformed.timestamp)?.getTime()}`;
    const event = eventById.get(eventId);

    if (!groupMap.has(mrn)) {
      groupMap.set(mrn, { events: [], records: [] });
    }
    const group = groupMap.get(mrn)!;
    group.records.push(record);
    if (event) {
      group.events.push(event);
    }
  }

  const patients: PatientRecord[] = [];

  for (const [mrn, group] of groupMap) {
    const sortedEvents = [...group.events].sort(
      (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
    );

    // Use the first record for patient demographics
    const firstRecord = group.records[0].transformed;

    // --- Determine admission date ---
    // Find the A04 (registration) or A01 (admission) record's visit.admitDateTime
    // This matches the backend which creates admissions from A04 messages
    const admissionRecord = group.records.find(
      (r) =>
        r.transformed.messageType === 'ADT^A04' ||
        r.transformed.messageType === 'ADT^A01'
    );

    // Fall back: use visit.admitDateTime from any record (it's the encounter admit date)
    const admitDateTimeRaw =
      admissionRecord?.transformed.visit?.admitDateTime ||
      firstRecord.visit?.admitDateTime;

    const admissionDate = parseHL7DateTime(admitDateTimeRaw) ?? undefined;

    // --- Determine discharge date ---
    // Find the A03 (discharge) record's visit.dischargeDateTime
    const dischargeRecord = group.records.find(
      (r) => r.transformed.messageType === 'ADT^A03'
    );
    const dischargeDateTimeRaw =
      dischargeRecord?.transformed.visit?.dischargeDateTime;
    const dischargeDate = parseHL7DateTime(dischargeDateTimeRaw) ?? undefined;

    // --- Determine status ---
    // Matches backend: Cancelled > Discharged > Admitted > Inactive > Unknown
    const hasCancel = group.records.some(
      (r) => r.transformed.messageType === 'ADT^A11'
    );
    const hasDischarge = !!dischargeRecord;
    const hasAdmission = !!admissionRecord;

    let status: PatientRecord['status'] = 'unknown';
    if (hasCancel) {
      status = 'cancelled';
    } else if (hasDischarge) {
      status = 'discharged';
    } else if (hasAdmission) {
      status = 'admitted';
    }

    // Validate: discharge must be after admission
    const validDischargeDate =
      admissionDate &&
      dischargeDate &&
      dischargeDate.getTime() >= admissionDate.getTime()
        ? dischargeDate
        : dischargeDate; // still show it even if invalid, LOS will show N/A

    const lastEvent = sortedEvents[sortedEvents.length - 1];
    const latestLocation = lastEvent?.location ?? { unit: '' };

    // Collect unique doctors
    const doctors = new Set<string>();
    for (const e of sortedEvents) {
      if (e.doctor) doctors.add(e.doctor);
    }

    patients.push({
      mrn: cleanMrn(mrn),
      name: firstRecord.patient?.name ?? { first: '', last: '' },
      dateOfBirth: firstRecord.patient?.dateOfBirth,
      sex: firstRecord.patient?.sex,
      facility: firstRecord.facility || '',
      events: sortedEvents,
      admissionDate,
      dischargeDate: validDischargeDate,
      status,
      latestLocation,
      insurance: firstRecord.insurance,
      doctors: Array.from(doctors),
    });
  }

  // Sort by most events first
  patients.sort((a, b) => b.events.length - a.events.length);

  return patients;
}

/**
 * Create lightweight summaries for the patient list sidebar.
 */
export function createPatientSummaries(
  patients: PatientRecord[]
): PatientSummary[] {
  return patients.map((p) => ({
    mrn: p.mrn,
    displayName: `${p.name.last}, ${p.name.first}`.trim() || p.mrn,
    eventCount: p.events.length,
    status: p.status,
    admissionDate: p.admissionDate,
    dischargeDate: p.dischargeDate,
    facility: p.facility,
  }));
}
