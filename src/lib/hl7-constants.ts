import { TimelineEventCategory } from './types';

export interface MessageTypeMeta {
  category: TimelineEventCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  hex: string; // raw hex for SVG fill/stroke
}

export const MESSAGE_TYPE_MAP: Record<string, MessageTypeMeta> = {
  'ADT^A01': {
    category: 'admission',
    label: 'Admission',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
    hex: '#22c55e',
  },
  'ADT^A04': {
    category: 'admission',
    label: 'Registration',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
    hex: '#22c55e',
  },
  'ADT^A03': {
    category: 'discharge',
    label: 'Discharge',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    dotColor: 'bg-red-500',
    hex: '#ef4444',
  },
  'ADT^A08': {
    category: 'update',
    label: 'Patient Update',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    dotColor: 'bg-blue-500',
    hex: '#3b82f6',
  },
  'ADT^A06': {
    category: 'transfer',
    label: 'Transfer (OP to IP)',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
    hex: '#f59e0b',
  },
  'ADT^A07': {
    category: 'transfer',
    label: 'Transfer (IP to OP)',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
    hex: '#f59e0b',
  },
  'ADT^A02': {
    category: 'transfer',
    label: 'Patient Transfer',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
    hex: '#f59e0b',
  },
  'ADT^A11': {
    category: 'cancel',
    label: 'Cancel Admit',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-500',
    hex: '#6b7280',
  },
  'ADT^A13': {
    category: 'cancel',
    label: 'Cancel Discharge',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-500',
    hex: '#6b7280',
  },
  'ADT^A12': {
    category: 'cancel',
    label: 'Cancel Transfer',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-500',
    hex: '#6b7280',
  },
  'MDM^T04': {
    category: 'document',
    label: 'Document Status',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    dotColor: 'bg-purple-500',
    hex: '#a855f7',
  },
};

const DEFAULT_META: MessageTypeMeta = {
  category: 'update',
  label: 'Unknown Event',
  color: 'text-slate-700',
  bgColor: 'bg-slate-50',
  borderColor: 'border-slate-300',
  dotColor: 'bg-slate-500',
  hex: '#64748b',
};

export function getMessageTypeMeta(messageType: string): MessageTypeMeta {
  return MESSAGE_TYPE_MAP[messageType] ?? { ...DEFAULT_META, label: messageType };
}

export const CATEGORY_LABELS: Record<TimelineEventCategory, string> = {
  admission: 'Admissions',
  discharge: 'Discharges',
  update: 'Updates',
  transfer: 'Transfers',
  cancel: 'Cancellations',
  document: 'Documents',
};

export const PATIENT_CLASS_LABELS: Record<string, string> = {
  I: 'Inpatient',
  O: 'Outpatient',
  E: 'Emergency',
  P: 'Pre-Admit',
  R: 'Recurring',
};

export const FACILITY_LABELS: Record<string, string> = {
  '012': 'DMC',
  '312': 'EMC',
  '025': 'Manteca',
  '012^02': 'DBH',
  '012^00': 'DMC',
  '312^00': 'EMC',
};

export function getFacilityLabel(code: string): string {
  return FACILITY_LABELS[code] || code;
}
