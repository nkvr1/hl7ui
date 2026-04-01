// Raw JSON shape (matches the HL7 transformed file structure)
export interface RawRecord {
  storagePath: string;
  transformed: TransformedMessage;
}

export interface TransformedMessage {
  eventType: string;
  messageType: string;
  messageControlId: string;
  timestamp: string;
  recordedDateTime: string;
  facility: string;
  sendingApplication: string;
  tenantId: string;
  storagePath: string;
  patient: RawPatient;
  visit: RawVisit;
  diagnoses?: Diagnosis[];
  insurance?: RawInsurance;
  nextOfKin?: NextOfKin[];
}

export interface RawPatient {
  id: string;
  mrn: string;
  name: { first: string; last: string; middle?: string };
  dateOfBirth?: string;
  sex?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  phoneNumber?: string;
  email?: string;
}

export interface RawVisit {
  patientClass: string;
  location: { unit: string; room?: string; bed?: string };
  admitDateTime: string;
  dischargeDateTime?: string;
  admitReason?: string;
  dischargeDisposition?: string;
  attendingDoctor?: { id: string; name: string };
  admittingPhysician?: { id: string; name: string };
  dischargingPhysician?: { id: string; name: string };
  totalCharges?: string;
}

export interface Diagnosis {
  code?: string;
  description?: string;
  type?: string;
  dateTime?: string;
}

export interface RawInsurance {
  planId?: string;
  companyName?: string;
  policyNumber?: string;
  groupNumber?: string;
  effectiveDate?: string;
}

export interface NextOfKin {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
}

// Processed types for the timeline
export type TimelineEventCategory =
  | 'admission'
  | 'discharge'
  | 'update'
  | 'transfer'
  | 'cancel'
  | 'document';

export interface TimelineEvent {
  id: string;
  category: TimelineEventCategory;
  messageType: string;
  label: string;
  dateTime: Date;
  doctor: string;
  attendingDoctor?: string;
  admittingPhysician?: string;
  dischargingPhysician?: string;
  visitAdmitDate?: Date;
  visitDischargeDate?: Date;
  location: { unit: string; room?: string; bed?: string };
  patientClass: string;
  totalCharges?: number;
  admitReason?: string;
  diagnoses?: Diagnosis[];
  dischargeDisposition?: string;
  raw: TransformedMessage;
}

export interface PatientRecord {
  mrn: string;
  name: { first: string; last: string; middle?: string };
  dateOfBirth?: string;
  sex?: string;
  facility: string;
  events: TimelineEvent[];
  admissionDate?: Date;
  dischargeDate?: Date;
  status: 'admitted' | 'discharged' | 'cancelled' | 'unknown';
  latestLocation: { unit: string; room?: string; bed?: string };
  insurance?: RawInsurance;
  doctors: string[];
}

export interface PatientSummary {
  mrn: string;
  displayName: string;
  eventCount: number;
  status: PatientRecord['status'];
  admissionDate?: Date;
  dischargeDate?: Date;
  facility: string;
}

export type TimelineLayout = 'horizontal' | 'vertical';

export interface CollapsedGroup {
  type: 'collapsed';
  events: TimelineEvent[];
  startTime: Date;
  endTime: Date;
  count: number;
  category: TimelineEventCategory;
  label: string;
}

export type TimelineItem = TimelineEvent | CollapsedGroup;

export function isCollapsedGroup(item: TimelineItem): item is CollapsedGroup {
  return 'type' in item && item.type === 'collapsed';
}
