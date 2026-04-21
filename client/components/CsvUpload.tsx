"use client";

import React, { useState, useRef } from 'react';

type ParsedData = Record<string, string | number | boolean>[];

export default function CsvUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ParsedData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
        setError("Please select a valid CSV file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setData(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.data && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full flex-grow relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-zinc-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-zinc-100 file:text-zinc-700
                hover:file:bg-zinc-200
                dark:file:bg-zinc-800 dark:file:text-zinc-300
                dark:hover:file:bg-zinc-700
                transition-colors cursor-pointer"
              disabled={isLoading}
            />
          </div>
          <div className="w-full sm:w-auto flex gap-3">
            {file && (
              <button
                onClick={clearSelection}
                disabled={isLoading}
                className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear selection"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload CSV'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 flex items-center gap-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-6 py-4 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors">
                  {Object.values(row).map((val, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {data && data.length === 0 && (
        <div className="p-12 text-center text-sm text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
          No data found in the uploaded file.
        </div>
      )}
    </div>
  );
}
