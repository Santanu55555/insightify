"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { KpiData, RevenuePoint, LeadsBySource, Insight } from '@/types/analytics';

type Props = {
  kpis: KpiData;
  leadsData: LeadsBySource[];
  revenueData: RevenuePoint[];
  insights: Insight[];
};

export default function AiInsightsPanel({ kpis, leadsData, revenueData, insights }: Props) {
  const { data: session } = useSession();
  const [aiInsights, setAiInsights] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiInsights = async () => {
    if (aiInsights) return; // Cache result

    setIsLoading(true);
    setError(null);

    const trend = revenueData.length > 1
      ? (revenueData[revenueData.length - 1].revenue >= revenueData[0].revenue ? 'increasing' : 'decreasing')
      : 'stable';

    const payload = {
      totalLeads: kpis.totalLeads,
      totalRevenue: kpis.totalRevenue,
      avgConversion: kpis.avgConversionRate,
      topSource: leadsData.length > 0 ? leadsData[0].source : 'Unknown',
      trend,
      insights: insights.map(i => i.message),
      userId: session?.user?.id,
    };

    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const apiBase = `http://${hostname}:5001`;

    try {
      const response = await fetch(`${apiBase}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch AI insights. Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setAiInsights(result.insights || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating insights.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <svg className="w-48 h-48 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="text-xl">✨</span> AI-Powered Insights
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Let advanced AI analyze your data and extract hidden business value.
          </p>
        </div>
        
        {!aiInsights && (
          <button
            onClick={fetchAiInsights}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all shrink-0
              ${isLoading 
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : 'Generate AI Insights'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl">
          {error}
        </div>
      )}

      {aiInsights && aiInsights.length > 0 && (
        <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-bold text-sm">
                {idx + 1}
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed pt-1.5">
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {aiInsights && aiInsights.length === 0 && (
        <div className="p-4 text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          No insights could be generated at this time.
        </div>
      )}
    </div>
  );
}
