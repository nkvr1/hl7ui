'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileJson, Loader2, AlertCircle } from 'lucide-react';
import { useDataContext } from '@/context/DataContext';
import { parseRawData } from '@/lib/parser';
import { groupByPatient, createPatientSummaries } from '@/lib/patient-grouper';
import { useRouter } from 'next/navigation';

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setData } = useDataContext();
  const router = useRouter();

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      try {
        setProgress('Reading file...');
        const text = await file.text();

        setProgress('Parsing JSON...');
        const json = JSON.parse(text);

        setProgress('Validating records...');
        const { records, skipped, total } = parseRawData(json);

        if (records.length === 0) {
          throw new Error(
            `No valid records found in ${total} entries. Ensure the JSON contains objects with a "transformed" property.`
          );
        }

        setProgress(`Grouping ${records.length} records by patient...`);
        const patients = groupByPatient(records);
        const summaries = createPatientSummaries(patients);

        setData({
          patientRecords: patients,
          patientSummaries: summaries,
          fileName: file.name,
          recordCount: records.length,
          skippedCount: skipped,
        });

        setProgress('');
        router.push('/timeline');
      } catch (err) {
        const message =
          err instanceof SyntaxError
            ? 'Invalid JSON file. Please check the file format.'
            : err instanceof Error
              ? err.message
              : 'Failed to process file';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [setData, router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        processFile(file);
      } else {
        setError('Please drop a JSON file');
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
          }
          ${isProcessing ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">{progress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-blue-50 p-4">
              {isDragging ? (
                <FileJson className="h-10 w-10 text-blue-500" />
              ) : (
                <Upload className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragging ? 'Drop your file here' : 'Upload HL7 JSON File'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Drag and drop or click to browse
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Supports HL7 transformed JSON files
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
