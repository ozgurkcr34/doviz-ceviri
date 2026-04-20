"use client";

import { RefreshCw } from "lucide-react";
import CurrencyCard from "@/components/CurrencyCard";
import MetalCard from "@/components/MetalCard";
import { useRates } from "@/hooks/useRates";

export default function Home() {
  const { rates, lastUpdate, loading, error, refetch } = useRates();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Error banner */}
        {error && (
          <div className="mb-6 px-5 py-4 border border-red-200 bg-red-50 text-red-600 text-sm flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-700 font-medium flex-shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tekrar dene
            </button>
          </div>
        )}

        {/* Two-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0">
          <div className="md:border-r-0">
            <CurrencyCard rates={rates} loading={loading} />
          </div>
          <MetalCard rates={rates} loading={loading} />
        </div>

        {/* Footer */}
        {lastUpdate && (
          <p className="text-center text-[11px] text-neutral-400 mt-6 tracking-wide">
            Son güncelleme:{" "}
            {new Date(lastUpdate).toLocaleString("tr-TR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>
    </main>
  );
}
