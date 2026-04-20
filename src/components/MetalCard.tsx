"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import type { SelectOption } from "./SearchableSelect";
import { CURRENCIES, formatNumber } from "@/lib/currencies";
import {
  GOLD_UNITS,
  SILVER_UNITS,
  TROY_OUNCE_GRAMS,
  calculateMetalValue,
  type MetalType,
} from "@/lib/metals";
import { useDebounce } from "@/hooks/useDebounce";

interface MetalCardProps {
  rates: Record<string, number> | null;
  loading: boolean;
}

export default function MetalCard({ rates, loading }: MetalCardProps) {
  const [metalType, setMetalType] = useState<MetalType>("gold");
  const [amount, setAmount] = useState("1");
  const [unitId, setUnitId] = useState("gram");
  const [currency, setCurrency] = useState("TRY");

  const debouncedAmount = useDebounce(amount, 150);

  const units = metalType === "gold" ? GOLD_UNITS : SILVER_UNITS;
  const currentUnit = units.find((u) => u.id === unitId) ?? units[0];
  const metalCode = metalType === "gold" ? "XAU" : "XAG";
  const metalLabel = metalType === "gold" ? "Altın" : "Gümüş";

  const hasMetalRate = !!(rates && rates[metalCode]);

  // Price per ounce in USD: rates[XAU] = ounces per 1 USD, so invert
  const pricePerOunceUSD = useMemo(() => {
    if (!rates || !rates[metalCode]) return null;
    return 1 / rates[metalCode];
  }, [rates, metalCode]);

  const currencyOptions: SelectOption[] = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
      })),
    []
  );

  const unitOptions: SelectOption[] = useMemo(
    () => units.map((u) => ({ value: u.id, label: u.label })),
    [units]
  );

  const result = useMemo(() => {
    if (!pricePerOunceUSD || !rates) return null;
    const num = parseFloat(
      debouncedAmount.replace(/\./g, "").replace(",", ".")
    );
    if (isNaN(num)) return null;
    const targetRate = rates[currency] || 1;
    return calculateMetalValue(pricePerOunceUSD, num, currentUnit, targetRate);
  }, [debouncedAmount, pricePerOunceUSD, currentUnit, currency, rates]);

  const pricePerGram = useMemo(() => {
    if (!pricePerOunceUSD || !rates) return null;
    const targetRate = rates[currency] || 1;
    return (pricePerOunceUSD / TROY_OUNCE_GRAMS) * targetRate;
  }, [pricePerOunceUSD, currency, rates]);

  const handleMetalSwitch = (type: MetalType) => {
    setMetalType(type);
    setUnitId("gram");
  };

  return (
    <div className="border border-neutral-200 bg-white p-6 sm:p-8">
      {/* Header */}
      <h2 className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase mb-8">
        Emtia Çevirici
      </h2>

      {/* Metal type toggle */}
      <div className="flex border border-neutral-200 mb-6">
        {(["gold", "silver"] as MetalType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleMetalSwitch(type)}
            className={[
              "flex-1 py-3 text-sm font-medium transition-colors cursor-pointer",
              metalType === type
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50",
            ].join(" ")}
          >
            {type === "gold" ? "Altın" : "Gümüş"}
          </button>
        ))}
      </div>

      {/* No metal data fallback */}
      {!loading && !hasMetalRate ? (
        <div className="py-10 text-center">
          <p className="text-sm text-neutral-500 mb-1">
            {metalLabel} verisi mevcut değil.
          </p>
          <p className="text-xs text-neutral-400">
            Tam erişim için{" "}
            <code className="text-[11px] bg-neutral-100 px-1.5 py-0.5">
              .env.local
            </code>{" "}
            dosyasına API anahtarınızı ekleyin.
          </p>
        </div>
      ) : (
        <>
          {/* Amount + Unit */}
          <div className="flex gap-2 sm:gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <label
                htmlFor="metal-amount"
                className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2"
              >
                Miktar
              </label>
              <input
                id="metal-amount"
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
            <div className="w-40 sm:w-44 flex-shrink-0">
              <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Birim
              </label>
              <SearchableSelect
                id="metal-unit"
                options={unitOptions}
                value={unitId}
                onChange={setUnitId}
              />
            </div>
          </div>

          {/* Target currency */}
          <div className="mb-8">
            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Döviz Birimi
            </label>
            <SearchableSelect
              id="metal-currency"
              options={currencyOptions}
              value={currency}
              onChange={setCurrency}
            />
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
                {formatNumber(result, currency)}
                <span className="text-base sm:text-lg text-neutral-400 font-medium ml-2">
                  {currency}
                </span>
              </p>
              {pricePerGram !== null && (
                <p className="text-sm text-neutral-400 mt-2">
                  1 gram {metalLabel.toLowerCase()} ={" "}
                  {formatNumber(pricePerGram, currency)} {currency}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 py-6">
              Bir miktar girin
            </p>
          )}
        </>
      )}
    </div>
  );
}
