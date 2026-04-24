"use client";

import { Insight } from '@/types/analytics';

type Props = {
  insights: Insight[];
};

const typeConfig: Record<
  Insight['type'],
  { bg: string; border: string; icon: string; text: string }
> = {
  positive: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: '✅',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '⚠️',
    text: 'text-amber-800 dark:text-amber-300',
  },
  neutral: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'ℹ️',
    text: 'text-blue-800 dark:text-blue-300',
  },
};

export default function Insights({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-5">
        Automated Insights
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight) => {
          const cfg = typeConfig[insight.type];
          return (
            <div
              key={insight.id}
              className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}
            >
              <span className="text-xl leading-none mt-px">{cfg.icon}</span>
              <p className={`text-sm font-medium leading-relaxed ${cfg.text}`}>
                {insight.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
