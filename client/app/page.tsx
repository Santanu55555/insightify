import UserAccount from "@/components/UserAccount";
import CsvUpload from "@/components/CsvUpload";
import HistorySidebar from "@/components/HistorySidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-24">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            I
          </div>
          <span className="text-lg font-bold text-zinc-900 dark:text-white">Insightify</span>
          <div className="ml-auto flex items-center gap-6">
            <span className="hidden sm:inline text-xs text-zinc-400 dark:text-zinc-500 font-mono">CSV Analytics Dashboard</span>
            <UserAccount />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Upload a CSV file with your marketing data to instantly generate KPIs, charts, and automated insights.
          </p>
        </div>

        <CsvUpload />
      </main>
      <HistorySidebar />
    </div>
  );
}
