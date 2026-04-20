"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CurrencySelect from "@/components/CurrencySelect";
import {
  CURRENCIES,
  GOLD_CODE,
  TROY_OUNCE_TO_GRAM,
  formatNumber,
  getCurrencyByCode,
} from "@/lib/currencies";

interface RatesData {
  rates: Record<string, number>;
  lastUpdate: string;
  nextUpdate: string;
}

export default function CurrencyConverter() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("TRY");
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("");
  const [activeInput, setActiveInput] = useState<"from" | "to">("from");

  // Track which field the user is actively editing to prevent infinite loops
  const lastEditedRef = useRef<"from" | "to">("from");

  // Fetch rates
  useEffect(() => {
    async function fetchRates() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/rates");
        const data: RatesData | { error: string } = await res.json();

        if ("error" in data) {
          throw new Error(data.error);
        }

        setRates(data.rates);
        setLastUpdate(data.lastUpdate);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Döviz kurları yüklenirken bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  // Convert between currencies
  const convert = useCallback(
    (
      amount: number,
      from: string,
      to: string,
      ratesMap: Record<string, number>
    ): number => {
      if (from === to) return amount;

      const fromRate = ratesMap[from];
      const toRate = ratesMap[to];

      if (!fromRate || !toRate) return 0;

      // Convert: amount in "from" → USD → "to"
      const amountInUSD = amount / fromRate;
      return amountInUSD * toRate;
    },
    []
  );

  // Recalculate when relevant values change
  const recalculate = useCallback(
    (direction: "from" | "to", amount: string, from: string, to: string) => {
      if (!rates) return;

      if (direction === "from") {
        const num = parseFloat(amount.replace(/\./g, "").replace(",", "."));
        if (isNaN(num) || amount === "") {
          setToAmount("");
          return;
        }
        const result = convert(num, from, to, rates);
        setToAmount(formatNumber(result, to));
      } else {
        const num = parseFloat(amount.replace(/\./g, "").replace(",", "."));
        if (isNaN(num) || amount === "") {
          setFromAmount("");
          return;
        }
        const result = convert(num, to, from, rates);
        setFromAmount(formatNumber(result, from));
      }
    },
    [rates, convert]
  );

  // Recalculate when currencies change or rates load
  useEffect(() => {
    if (!rates) return;
    recalculate(
      lastEditedRef.current,
      lastEditedRef.current === "from" ? fromAmount : toAmount,
      fromCurrency,
      toCurrency
    );
    // Only re-run when currencies or rates change, NOT when amounts change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency, rates, recalculate]);

  // Handle initial calculation when rates first load
  useEffect(() => {
    if (rates && fromAmount === "1" && toAmount === "") {
      recalculate("from", "1", fromCurrency, toCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates]);

  // Swap currencies
  const handleSwap = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    const prevFromAmount = fromAmount;

    setFromCurrency(prevTo);
    setToCurrency(prevFrom);
    lastEditedRef.current = "from";

    // Parse and set from amount, then recalculate
    setFromAmount(prevFromAmount);
    setTimeout(() => {
      recalculate("from", prevFromAmount, prevTo, prevFrom);
    }, 0);
  };

  // Handle input changes
  const handleFromChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, "");
    setActiveInput("from");
    lastEditedRef.current = "from";
    setFromAmount(cleaned);
    recalculate("from", cleaned, fromCurrency, toCurrency);
  };

  const handleToChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, "");
    setActiveInput("to");
    lastEditedRef.current = "to";
    setToAmount(cleaned);
    recalculate("to", cleaned, fromCurrency, toCurrency);
  };

  // Calculate display rate
  const getDisplayRate = (): string => {
    if (!rates) return "";
    const rate = convert(1, fromCurrency, toCurrency, rates);
    if (rate === 0) return "";

    const fromInfo = getCurrencyByCode(fromCurrency);
    const toInfo = getCurrencyByCode(toCurrency);
    if (!fromInfo || !toInfo) return "";

    const isGold = toCurrency === GOLD_CODE || fromCurrency === GOLD_CODE;
    const gramNote = isGold ? ` (1 ons = ${TROY_OUNCE_TO_GRAM} gram)` : "";

    return `1 ${fromInfo.code} = ${formatNumber(rate, toCurrency)} ${toInfo.code}${gramNote}`;
  };

  const isGoldActive = fromCurrency === GOLD_CODE || toCurrency === GOLD_CODE;
  const toInfo = getCurrencyByCode(toCurrency);

  return (
    <div className="converter-card">
      {/* Header */}
      <div className="card-header">
        <h1 className="card-title">Döviz & Altın Çevirici</h1>
        <p className="card-subtitle">Anlık kur verileriyle hızlı çeviri</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="status-bar loading">
          <div className="spinner" />
          <span>Kurlar yükleniyor...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="status-bar error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Converter body */}
      {!loading && !error && rates && (
        <>
          {/* From row */}
          <div>
            <div className="input-group-label">Kaynak</div>
            <div className="input-group">
              <div className="amount-wrapper">
                <input
                  id="from-amount"
                  type="text"
                  inputMode="decimal"
                  className="amount-input"
                  placeholder="0,00"
                  value={fromAmount}
                  onChange={(e) => handleFromChange(e.target.value)}
                  onFocus={() => setActiveInput("from")}
                  autoComplete="off"
                />
              </div>
              <CurrencySelect
                id="from-currency-select"
                currencies={CURRENCIES}
                value={fromCurrency}
                onChange={(code) => {
                  setFromCurrency(code);
                  lastEditedRef.current = "from";
                }}
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="swap-container">
            <button
              className="swap-btn"
              onClick={handleSwap}
              aria-label="Para birimlerini değiştir"
              title="Değiştir"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To row */}
          <div>
            <div className="input-group-label">Hedef</div>
            <div className="input-group">
              <div className="amount-wrapper">
                <input
                  id="to-amount"
                  type="text"
                  inputMode="decimal"
                  className="amount-input"
                  placeholder="0,00"
                  value={toAmount}
                  onChange={(e) => handleToChange(e.target.value)}
                  onFocus={() => setActiveInput("to")}
                  autoComplete="off"
                />
              </div>
              <CurrencySelect
                id="to-currency-select"
                currencies={CURRENCIES}
                value={toCurrency}
                onChange={(code) => {
                  setToCurrency(code);
                  lastEditedRef.current = "from";
                }}
              />
            </div>
          </div>

          {/* Result display */}
          <div className={`result-bar ${isGoldActive ? "gold-active" : ""}`}>
            <div className="result-label">Sonuç</div>
            <div className="result-value">
              {toAmount || "0"}
              <span className="result-currency">
                {toInfo?.flag} {toInfo?.code}
              </span>
            </div>
            <div className="result-rate">{getDisplayRate()}</div>
          </div>

          {/* Footer info */}
          {lastUpdate && (
            <div className="footer-info">
              Son güncelleme:{" "}
              {new Date(lastUpdate).toLocaleString("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
