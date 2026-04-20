"use client";

import { useState, useEffect, useCallback } from "react";

interface UseRatesReturn {
  rates: Record<string, number> | null;
  lastUpdate: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRates(): UseRatesReturn {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rates");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRates(data.rates);
      setLastUpdate(data.lastUpdate || "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kurlar yüklenirken hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return { rates, lastUpdate, loading, error, refetch: fetchRates };
}
