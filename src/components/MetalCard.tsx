"use client";

import { useState, useMemo } from "react";
import { Loader2, Info } from "lucide-react";
import SearchableSelect from "./SearchableSelect";
import type { SelectOption } from "./SearchableSelect";
import { CURRENCIES, formatNumber } from "@/lib/currencies";
import {
  CATEGORIES,
  TROY_OUNCE_GRAMS,
  calculateGold,
  getTypesByCategory,
  type GoldCategory,
  type MetalType,
} from "@/lib/metals";
import { useDebounce } from "@/hooks/useDebounce";

interface MetalCardProps {
  rates: Record<string, number> | null;
  loading: boolean;
}

export default function MetalCard({ rates, loading }: MetalCardProps) {
  const [category, setCategory] = useState<GoldCategory>("purity");
  const [typeId, setTypeId] = useState("has");
  const [amount, setAmount] = useState("1");
  const [currency, setCurrency] = useState("TRY");

  const debouncedAmount = useDebounce(amount, 150);

  const typesInCategory = useMemo(
    () => getTypesByCategory(category),
    [category]
  );

  const selectedType: MetalType | undefined = useMemo(
    () =>
      typesInCategory.find((t) => t.id === typeId) ?? typesInCategory[0],
    [typesInCategory, typeId]
  );

  // ── Spot prices (USD per troy ounce) ──
  const xauPriceUSD = useMemo(() => {
    if (!rates || !rates["XAU"]) return null;
    return 1 / rates["XAU"];
  }, [rates]);

  const xagPriceUSD = useMemo(() => {
    if (!rates || !rates["XAG"]) return null;
    return 1 / rates["XAG"];
  }, [rates]);

  const hasMetalData = selectedType?.isSilver
    ? xagPriceUSD !== null
    : xauPriceUSD !== null;

  // ── Select options ──
  const currencyOptions: SelectOption[] = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        label: c.name,
        icon: c.flag,
      })),
    []
  );

  const typeOptions: SelectOption[] = useMemo(
    () => typesInCategory.map((t) => ({ value: t.id, label: t.label })),
    [typesInCategory]
  );

  // ── Calculation ──
  const result = useMemo(() => {
    if (!selectedType || !rates) return null;
    const num = parseFloat(
      debouncedAmount.replace(/\./g, "").replace(",", ".")
    );
    if (isNaN(num) || num === 0) return null;
    const targetRate = rates[currency] || 1;
    return calculateGold(
      selectedType,
      num,
      xauPriceUSD,
      xagPriceUSD,
      targetRate
    );
  }, [debouncedAmount, selectedType, xauPriceUSD, xagPriceUSD, currency, rates]);

  // Has gram price in target currency (for the info line)
  const hasGramPrice = useMemo(() => {
    if (!rates) return null;
    const spot = selectedType?.isSilver ? xagPriceUSD : xauPriceUSD;
    if (spot === null) return null;
    const targetRate = rates[currency] || 1;
    return (spot / TROY_OUNCE_GRAMS) * targetRate;
  }, [selectedType, xauPriceUSD, xagPriceUSD, currency, rates]);

  // ── Category change ──
  const handleCategoryChange = (cat: GoldCategory) => {
    setCategory(cat);
    const firstType = getTypesByCategory(cat)[0];
    if (firstType) setTypeId(firstType.id);
  };

  return (
    <div className="border border-neutral-200 bg-white p-6 sm:p-8">
      {/* Header */}
      <h2 className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase mb-6">
        Altın & Emtia
      </h2>

      {/* Category tabs */}
      <div className="flex border border-neutral-200 mb-6 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={[
              "flex-1 min-w-0 py-2.5 text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap px-1.5 sm:px-3 cursor-pointer",
              category === cat.id
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50",
            ].join(" ")}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* No data fallback */}
      {!loading && !hasMetalData ? (
        <div className="py-10 text-center">
          <p className="text-sm text-neutral-500 mb-1">
            {selectedType?.isSilver ? "Gümüş" : "Altın"} verisi mevcut
            değil.
          </p>
          <p className="text-xs text-neutral-400">
            API yanıtında{" "}
            {selectedType?.isSilver ? "XAG" : "XAU"} bulunamadı.
          </p>
        </div>
      ) : (
        <>
          {/* Type selector */}
          <div className="mb-1">
            <label className="block text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
              Tür
            </label>
            <SearchableSelect
              id="metal-type"
              options={typeOptions}
              value={selectedType?.id ?? typeId}
              onChange={setTypeId}
            />
          </div>

          {/* Caption */}
          {selectedType && (
            <p className="text-[11px] text-neutral-400 mt-1.5 mb-6 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{selectedType.caption}</span>
            </p>
          )}

          {/* Amount input */}
          <div className="mb-6">
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
                "w-full h-14 px-4 text-2xl font-semibold tracking-tight font-mono tabular-nums",
                "border border-neutral-200 outline-none",
                "transition-all duration-150",
                "focus:border-neutral-400",
                "placeholder:text-neutral-300 placeholder:font-sans",
                loading ? "opacity-40 pointer-events-none" : "",
              ].join(" ")}
              placeholder="0"
              disabled={loading}
            />
            <p className="text-[11px] text-neutral-400 mt-1 uppercase tracking-wider">
              {selectedType?.inputUnit}
            </p>
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
              <p className="text-3xl sm:text-[2.25rem] font-bold tracking-tight leading-tight font-mono tabular-nums">
                {formatNumber(result, currency)}
                <span className="text-base sm:text-lg text-neutral-400 font-medium ml-2 font-sans">
                  {currency}
                </span>
              </p>
              {hasGramPrice !== null && (
                <p className="text-[13px] text-neutral-400 mt-2.5">
                  1 gram {selectedType?.isSilver ? "gümüş" : "has altın"} ={" "}
                  <span className="font-mono tabular-nums">
                    {formatNumber(hasGramPrice, currency)}
                  </span>{" "}
                  {currency}
                </p>
              )}
              {selectedType?.spreadPercent && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  Piyasa makası dahil (+%{selectedType.spreadPercent})
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
