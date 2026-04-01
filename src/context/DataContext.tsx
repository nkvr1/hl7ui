'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PatientRecord, PatientSummary } from '@/lib/types';

interface DataState {
  patientRecords: PatientRecord[];
  patientSummaries: PatientSummary[];
  fileName: string;
  recordCount: number;
  skippedCount: number;
  isLoaded: boolean;
}

type DataAction =
  | {
      type: 'SET_DATA';
      payload: {
        patientRecords: PatientRecord[];
        patientSummaries: PatientSummary[];
        fileName: string;
        recordCount: number;
        skippedCount: number;
      };
    }
  | { type: 'CLEAR_DATA' };

const initialState: DataState = {
  patientRecords: [],
  patientSummaries: [],
  fileName: '',
  recordCount: 0,
  skippedCount: 0,
  isLoaded: false,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...action.payload,
        isLoaded: true,
      };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}

interface SetDataPayload {
  patientRecords: PatientRecord[];
  patientSummaries: PatientSummary[];
  fileName: string;
  recordCount: number;
  skippedCount: number;
}

interface DataContextValue extends DataState {
  setData: (payload: SetDataPayload) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const setData = (payload: {
    patientRecords: PatientRecord[];
    patientSummaries: PatientSummary[];
    fileName: string;
    recordCount: number;
    skippedCount: number;
  }) => {
    dispatch({ type: 'SET_DATA', payload });
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  return (
    <DataContext.Provider value={{ ...state, setData, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return ctx;
}
