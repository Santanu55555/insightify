"use client";

import { KpiData } from '@/types/analytics';

type Props = {
  kpis: KpiData;
};

type KpiCardProps = {
  title: string;
  value: string;
  sub: string;
  accent: string;
};

function KpiCard({ title, value, sub, accent }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${accent}`}>
        {title === 'Total Leads' ? '👥' : title === 'Total Revenue' ? '💰' : '📈'}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
    </div>
  );
}

export default function KpiCards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KpiCard
        title="Total Leads"
        value={kpis.totalLeads.toLocaleString()}
        sub="Across all sources and periods"
        accent="bg-blue-50 dark:bg-blue-900/20"
      />
      <KpiCard
        title="Total Revenue"
        value={`$${kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sub="Cumulative revenue from all entries"
        accent="bg-emerald-50 dark:bg-emerald-900/20"
      />
      <KpiCard
        title="Avg. Conversion Rate"
        value={`${kpis.avgConversionRate.toFixed(2)}%`}
        sub="Mean conversion rate across all rows"
        accent="bg-violet-50 dark:bg-violet-900/20"
      />
    </div>
  );
}
