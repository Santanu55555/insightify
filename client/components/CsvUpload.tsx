"use client";

import React, { useState, useRef } from 'react';
import KpiCards from './KpiCards';
import Charts from './Charts';
import Insights from './Insights';
import AiInsightsPanel from './AiInsightsPanel';
import {
  parseRows,
  computeKpis,
  buildRevenueOverTime,
  buildLeadsBySource,
  generateInsights,
} from '@/lib/analytics';
import { CsvRow, KpiData, RevenuePoint, LeadsBySource, Insight } from '@/types/analytics';
import { Settings, Upload, Check, AlertTriangle, X } from 'lucide-react';

type AnalyticsState = {
  rows: CsvRow[];
  kpis: KpiData;
  revenueData: RevenuePoint[];
  leadsData: LeadsBySource[];
  insights: Insight[];
  fileName: string;
};

type ColumnMap = {
  date: string;
  source: string;
  leads: string;
  conversion_rate: string;
  revenue: string;
};

export default function CsvUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [mapping, setMapping] = useState<ColumnMap>({
    date: 'date',
    source: 'source',
    leads: 'leads',
    conversion_rate: 'conversion_rate',
    revenue: 'revenue',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Read headers to pre-check mapping
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const firstLine = text.split('\n')[0];
      const detectedHeaders = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      setHeaders(detectedHeaders);
      
      // Auto-detect mappings
      const newMapping = { ...mapping };
      detectedHeaders.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes('date')) newMapping.date = h;
        if (lower.includes('source') || lower.includes('channel')) newMapping.source = h;
        if (lower.includes('lead')) newMapping.leads = h;
        if (lower.includes('rate') || lower.includes('cr')) newMapping.conversion_rate = h;
        if (lower.includes('revenue') || lower.includes('income')) newMapping.revenue = h;
      });
      setMapping(newMapping);
      setShowMapping(true);
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setShowMapping(false);

    const formData = new FormData();
    formData.append('file', file);

    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const apiBase = `http://${hostname}:5001`;

    try {
      const response = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const result = await response.json();
      const raw: Record<string, string>[] = Array.isArray(result) ? result : (result.data || []);

      if (raw.length === 0) throw new Error('No data found in CSV.');

      // Apply mapping to raw data before parsing
      const mappedRaw = raw.map(row => ({
        date: row[mapping.date],
        source: row[mapping.source],
        leads: row[mapping.leads],
        conversion_rate: row[mapping.conversion_rate],
        revenue: row[mapping.revenue],
      }));

      const rows = parseRows(mappedRaw);
      
      setAnalytics({
        rows,
        kpis: computeKpis(rows),
        revenueData: buildRevenueOverTime(rows),
        leadsData: buildLeadsBySource(rows),
        insights: generateInsights(rows),
        fileName: file.name
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Upload Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-8">
        {!showMapping ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Click or drag to upload CSV</p>
            <p className="text-xs text-zinc-500 mt-1 text-center max-w-xs">Supported columns: Date, Source, Leads, Conversion Rate, Revenue</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="text-indigo-600 w-5 h-5" />
                <h3 className="font-bold">Map CSV Columns</h3>
              </div>
              <button onClick={() => setShowMapping(false)} className="text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(mapping).map((key) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Required: {key.replace('_', ' ')}</label>
                  <select
                    value={mapping[key as keyof ColumnMap]}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowMapping(false)} className="px-4 py-2 text-sm font-medium text-zinc-600">Cancel</button>
              <button 
                onClick={handleUpload}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <Check size={16} /> Confirm & Analyze
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Generating insights with Gemini...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 rounded-xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analytics && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <KpiCards kpis={analytics.kpis} />
          <Charts revenueData={analytics.revenueData} leadsData={analytics.leadsData} />
          <Insights insights={analytics.insights} />
          <AiInsightsPanel 
            kpis={analytics.kpis} 
            leadsData={analytics.leadsData} 
            revenueData={analytics.revenueData} 
            insights={analytics.insights} 
          />
        </div>
      )}
    </div>
  );
}
