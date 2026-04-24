"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { History, ChevronRight, Clock, ExternalLink } from "lucide-react";

interface HistoryItem {
  id: string;
  createdAt: string;
  totalLeads: number;
  totalRevenue: number;
  topSource: string;
  insights: string[];
}

export default function HistorySidebar() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id && isOpen) {
      fetchHistory();
    }
  }, [session, isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const apiBase = `http://${hostname}:5001`;
      const response = await fetch(`${apiBase}/history?userId=${session?.user?.id}`);
      const data = await response.json();
      if (!data.error) setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className={`fixed right-0 top-16 bottom-0 z-40 transition-all duration-300 ${isOpen ? 'w-80' : 'w-0'}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-l-xl shadow-lg hover:text-indigo-600 transition-colors"
      >
        <History size={20} className={isOpen ? 'rotate-180 transition-transform' : ''} />
      </button>

      <div className="h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            Recent Insights
          </h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
            NEW
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="group p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <ExternalLink size={12} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    {item.totalLeads} Leads • ${item.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    Top Source: {item.topSource}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] text-zinc-400 line-clamp-2 italic">
                    &ldquo;{item.insights[0]}&rdquo;
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <History size={32} className="mx-auto text-zinc-200 mb-3" />
              <p className="text-xs text-zinc-500">No history yet. Generate some insights to see them here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
