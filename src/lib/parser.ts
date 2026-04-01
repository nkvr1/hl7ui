import { RawRecord, TransformedMessage, TimelineEvent } from './types';
import { getMessageTypeMeta } from './hl7-constants';
import { parseHL7DateTime } from './date-utils';

/**
 * Validate that the input is an array of raw HL7 records.
 * Returns valid records and a count of skipped ones.
 */
export function parseRawData(data: unknown): {
  records: RawRecord[];
  skipped: number;
  total: number;
} {
  if (!Array.isArray(data)) {
    throw new Error('JSON data must be an array of records');
  }

  const records: RawRecord[] = [];
  let skipped = 0;

  for (const item of data) {
    if (isValidRecord(item)) {
      records.push(item as RawRecord);
    } else {
      skipped++;
    }
  }

  return { records, skipped, total: data.length };
}

function isValidRecord(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;

  if (!obj.transformed || typeof obj.transformed !== 'object') return false;
  const transformed = obj.transformed as Record<string, unknown>;

  if (!transformed.messageType || typeof transformed.messageType !== 'string') return false;
  if (!transformed.patient || typeof transformed.patient !== 'object') return false;

  const patient = transformed.patient as Record<string, unknown>;
  if (!patient.mrn && !patient.id) return false;

  return true;
}

/**
 * Transform a single raw record into a TimelineEvent.
 */
export function transformRecord(record: RawRecord): TimelineEvent | null {
  const msg = record.transformed;
  const meta = getMessageTypeMeta(msg.messageType);

  const dateTime = parseHL7DateTime(msg.recordedDateTime || msg.timestamp);
  if (!dateTime) return null;

  const mrn = extractMrn(msg);
  if (!mrn) return null;

  const doctor = extractDoctor(msg);
  const location = msg.visit?.location ?? { unit: '' };

  return {
    id: msg.messageControlId || `${mrn}-${dateTime.getTime()}`,
    category: meta.category,
    messageType: msg.messageType,
    label: meta.label,
    dateTime,
    doctor,
    attendingDoctor: msg.visit?.attendingDoctor?.name || undefined,
    admittingPhysician: msg.visit?.admittingPhysician?.name || undefined,
    dischargingPhysician: msg.visit?.dischargingPhysician?.name || undefined,
    visitAdmitDate: parseHL7DateTime(msg.visit?.admitDateTime) ?? undefined,
    visitDischargeDate: parseHL7DateTime(msg.visit?.dischargeDateTime) ?? undefined,
    location,
    patientClass: msg.visit?.patientClass || '',
    totalCharges: msg.visit?.totalCharges
      ? parseFloat(msg.visit.totalCharges)
      : undefined,
    admitReason: msg.visit?.admitReason,
    diagnoses: msg.diagnoses,
    dischargeDisposition: msg.visit?.dischargeDisposition,
    raw: msg,
  };
}

/**
 * Transform all records into TimelineEvents.
 */
export function transformAllRecords(records: RawRecord[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const record of records) {
    const event = transformRecord(record);
    if (event) {
      events.push(event);
    }
  }
  return events;
}

export function extractMrn(msg: TransformedMessage): string {
  if (msg.patient?.mrn) return msg.patient.mrn;
  if (msg.patient?.id) {
    return msg.patient.id.split('^^^')[0];
  }
  return '';
}

function extractDoctor(msg: TransformedMessage): string {
  if (msg.visit?.attendingDoctor?.name) return msg.visit.attendingDoctor.name;
  if (msg.visit?.admittingPhysician?.name) return msg.visit.admittingPhysician.name;
  if (msg.visit?.dischargingPhysician?.name) return msg.visit.dischargingPhysician.name;
  return '';
}
