'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDataContext } from '@/context/DataContext';
import { parseRawData } from '@/lib/parser';
import { groupByPatient, createPatientSummaries } from '@/lib/patient-grouper';
import {
  Activity,
  FileJson,
  Loader2,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
  ArrowRight,
  Layers,
  Search,
  BarChart3,
} from 'lucide-react';

interface DataFile {
  name: string;
  size: number;
  modified: string;
}

interface HomeClientProps {
  files: DataFile[];
}

export function HomeClient({ files }: HomeClientProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadedFiles, setLoadedFiles] = useState<Set<string>>(new Set());
  const { setData } = useDataContext();
  const router = useRouter();

  const loadFile = useCallback(
    async (fileName: string) => {
      setError(null);
      setProcessing(fileName);

      try {
        setProgress('Loading file from server...');
        const res = await fetch(
          `/api/data-files/${encodeURIComponent(fileName)}`
        );
        if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
        const json = await res.json();

        setProgress('Validating records...');
        const { records, skipped } = parseRawData(json);

        if (records.length === 0) {
          throw new Error('No valid records found in file');
        }

        setProgress(`Processing ${records.length.toLocaleString()} records...`);
        const patients = groupByPatient(records);
        const summaries = createPatientSummaries(patients);

        setData({
          patientRecords: patients,
          patientSummaries: summaries,
          fileName,
          recordCount: records.length,
          skippedCount: skipped,
        });

        setLoadedFiles((prev) => new Set(prev).add(fileName));
        setProgress('');
        router.push('/timeline');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to process file'
        );
      } finally {
        setProcessing(null);
      }
    },
    [setData, router]
  );

  const loadAllFiles = useCallback(async () => {
    setError(null);
    setProcessing('__all__');

    try {
      let allRecords: unknown[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(
          `Loading file ${i + 1} of ${files.length}...`
        );
        const res = await fetch(
          `/api/data-files/${encodeURIComponent(file.name)}`
        );
        if (!res.ok) throw new Error(`Failed to load ${file.name}`);
        const json = await res.json();

        if (Array.isArray(json)) {
          allRecords = allRecords.concat(json);
        }
      }

      setProgress(`Processing ${allRecords.length.toLocaleString()} records...`);
      const { records, skipped } = parseRawData(allRecords);

      if (records.length === 0) {
        throw new Error('No valid records found across all files');
      }

      const patients = groupByPatient(records);
      const summaries = createPatientSummaries(patients);

      setData({
        patientRecords: patients,
        patientSummaries: summaries,
        fileName: `All files (${files.length})`,
        recordCount: records.length,
        skippedCount: skipped,
      });

      setProgress('');
      router.push('/timeline');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setProcessing(null);
    }
  }, [files, setData, router]);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-16 safe-bottom">
      {/* Hero */}
      <div className="mb-6 sm:mb-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4 sm:mb-6">
          <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2 sm:mb-3">
          Patient Timeline
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
          Visualize patient admissions, charge captures, and discharge events
          from HL7 transformed data.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {[
          { icon: Layers, label: 'Multi-file' },
          { icon: Search, label: 'Patient search' },
          { icon: BarChart3, label: 'Timeline views' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs sm:text-sm text-gray-600"
          >
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400" />
            {label}
          </div>
        ))}
      </div>

      {/* Dashboard link */}
      <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl
            hover:from-indigo-700 hover:to-blue-700 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <BarChart3 className="h-4 w-4" />
          Open Dashboard
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* File list card */}
      <div className="w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  Data Files
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 ml-1.5 sm:ml-2">
                  {files.length} file{files.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {files.length > 1 && (
              <button
                onClick={loadAllFiles}
                disabled={!!processing}
                className="group flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold bg-gray-900 text-white rounded-lg sm:rounded-xl
                  hover:bg-gray-800 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-sm touch-target"
              >
                {processing === '__all__' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Layers className="h-3.5 w-3.5" />
                )}
                {processing === '__all__' ? 'Loading...' : 'Load All'}
              </button>
            )}
          </div>

          {/* Files */}
          {files.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No JSON files found in the Data folder</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 stagger-children">
              {files.map((file) => {
                const isProcessing = processing === file.name;
                const isLoaded = loadedFiles.has(file.name);

                return (
                  <button
                    key={file.name}
                    onClick={() => loadFile(file.name)}
                    disabled={!!processing}
                    className={`
                      group w-full flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 text-left
                      transition-all duration-200 touch-target
                      ${isProcessing
                        ? 'bg-blue-50/80'
                        : 'hover:bg-gray-50/80 active:bg-gray-100/60'
                      }
                      disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <div className={`
                        w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0
                        transition-all duration-300
                        ${isLoaded
                          ? 'bg-emerald-50 text-emerald-500'
                          : isProcessing
                            ? 'bg-blue-100 text-blue-500'
                            : 'bg-blue-50 text-blue-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                        }
                      `}>
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        ) : isLoaded ? (
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <FileJson className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                          {formatSize(file.size)} · {file.modified.split('T')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2 sm:ml-3">
                      {!isProcessing && !isLoaded && (
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {processing && progress && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center gap-2.5 text-sm text-blue-600 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">{progress}</span>
            </div>
            <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 animate-scale-in">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error loading file</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
