import CsvUpload from "@/components/CsvUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Data Importer
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Upload your CSV files to process and visualize the data instantly.
          </p>
        </div>
        
        <CsvUpload />
      </main>
    </div>
  );
}
