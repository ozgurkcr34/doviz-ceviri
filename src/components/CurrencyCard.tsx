"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import type { SelectOption } from "./SearchableSelect";
import { CURRENCIES, formatNumber } from "@/lib/currencies";
import { useDebounce } from "@/hooks/useDebounce";

interface CurrencyCardProps {
  rates: Record<string, number> | null;
  loading: boolean;
}

export default function CurrencyCard({ rates, loading }: CurrencyCardProps) {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("TRY");
  const [amount, setAmount] = useState("1000");

  const debouncedAmount = useDebounce(amount, 150);

  const currencyOptions: SelectOption[] = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
      })),
    []
  );

  const convert = useCallback(
    (val: number, from: string, to: string): number => {
      if (!rates || from === to) return val;
      const fromRate = rates[from];
      const toRate = rates[to];
      if (!fromRate || !toRate) return 0;
      return (val / fromRate) * toRate;
    },
    [rates]
  );

  const result = useMemo(() => {
    const num = parseFloat(
      debouncedAmount.replace(/\./g, "").replace(",", ".")
    );
    if (isNaN(num) || !rates) return null;
    return convert(num, fromCurrency, toCurrency);
  }, [debouncedAmount, fromCurrency, toCurrency, rates, convert]);

  const unitRate = useMemo(() => {
    if (!rates) return null;
    return convert(1, fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency, rates, convert]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="border border-neutral-200 bg-white p-6 sm:p-8">
      {/* Header */}
      <h2 className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase mb-8">
        Döviz Çevirici
      </h2>

      {/* Amount */}
      <div className="mb-6">
        <label
          htmlFor="currency-amount"
          className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2"
        >
          Miktar
        </label>
        <input
          id="currency-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
          }
          className={[
            "w-full h-14 px-4 text-2xl font-semibold tracking-tight",
            "border border-neutral-200 outline-none",
            "transition-all duration-150",
            "focus:border-neutral-400",
            "placeholder:text-neutral-300",
            loading ? "opacity-40 pointer-events-none" : "",
          ].join(" ")}
          placeholder="0"
          disabled={loading}
        />
      </div>

      {/* From / Swap / To */}
      <div className="flex items-end gap-2 sm:gap-3 mb-8">
        <div className="flex-1 min-w-0">
          <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Kaynak
          </label>
          <SearchableSelect
            id="from-currency"
            options={currencyOptions}
            value={fromCurrency}
            onChange={setFromCurrency}
          />
        </div>

        <button
          onClick={handleSwap}
          className="h-14 w-12 flex items-center justify-center border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Kaynak ve hedef dövizi değiştir"
        >
          <ArrowUpDown className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="flex-1 min-w-0">
          <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Hedef
          </label>
          <SearchableSelect
            id="to-currency"
            options={currencyOptions}
            value={toCurrency}
            onChange={setToCurrency}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-100 mb-6" />

      {/* Result */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Yükleniyor</span>
        </div>
      ) : result !== null ? (
        <div>
          <p className="text-3xl sm:text-[2.25rem] font-bold tracking-tight leading-tight">
            {formatNumber(result, toCurrency)}
            <span className="text-base sm:text-lg text-neutral-400 font-medium ml-2">
              {toCurrency}
            </span>
          </p>
          {unitRate !== null && (
            <p className="text-sm text-neutral-400 mt-2">
              1 {fromCurrency} = {formatNumber(unitRate, toCurrency)}{" "}
              {toCurrency}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 py-6">Bir miktar girin</p>
      )}
    </div>
  );
}
