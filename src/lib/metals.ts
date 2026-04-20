export const TROY_OUNCE_GRAMS = 31.1035;

// ─── Categories ────────────────────────────────────────────────

export type GoldCategory = "weight" | "purity" | "coin" | "historical" | "silver";

export const CATEGORIES: { id: GoldCategory; label: string }[] = [
  { id: "weight", label: "Ağırlık" },
  { id: "purity", label: "Ayar" },
  { id: "coin", label: "Ziynet" },
  { id: "historical", label: "Tarihi" },
  { id: "silver", label: "Gümüş" },
];

// ─── Metal Type Definition ─────────────────────────────────────

export interface MetalType {
  id: string;
  label: string;
  category: GoldCategory;
  /**
   * Multiplied by has gram price (XAU/31.1035) to get the price of 1 unit.
   *
   * Examples:
   *   - Has gram: 1.0  (1g pure gold)
   *   - 22K gram: 0.916 (purity factor)
   *   - Çeyrek:   1.7548 (coin gold content in grams)
   *   - ONS:      31.1035 (grams in a troy ounce)
   */
  multiplier: number;
  /** Unit label displayed below the amount input */
  inputUnit: string;
  /** Informational caption shown below the type selector */
  caption: string;
  /** Spread percentage for historical/premium coins */
  spreadPercent?: number;
  /** If true, uses XAG (silver) spot price instead of XAU */
  isSilver?: boolean;
}

// ─── Gold & Silver Types ───────────────────────────────────────

export const METAL_TYPES: MetalType[] = [
  // ── Weight ──
  {
    id: "ons",
    label: "Altın (ONS)",
    category: "weight",
    multiplier: TROY_OUNCE_GRAMS,
    inputUnit: "ons",
    caption: "1 Troy Ons = 31.1035 gram",
  },
  {
    id: "kg",
    label: "Altın (KG)",
    category: "weight",
    multiplier: 1000,
    inputUnit: "kg",
    caption: "1 KG = 1000 gram has altın",
  },

  // ── Purity (per gram) ──
  {
    id: "has",
    label: "Has Altın (24 Ayar)",
    category: "purity",
    multiplier: 1.0,
    inputUnit: "gram",
    caption: "995/1000 saflık — Baz referans fiyat",
  },
  {
    id: "22k",
    label: "22 Ayar Altın",
    category: "purity",
    multiplier: 0.916,
    inputUnit: "gram",
    caption: "916/1000 saflık — Bilezik kalitesi",
  },
  {
    id: "18k",
    label: "18 Ayar Altın",
    category: "purity",
    multiplier: 0.75,
    inputUnit: "gram",
    caption: "750/1000 saflık",
  },
  {
    id: "14k",
    label: "14 Ayar Altın",
    category: "purity",
    multiplier: 0.585,
    inputUnit: "gram",
    caption: "585/1000 saflık",
  },

  // ── Ziynet / Coins (per piece) ──
  {
    id: "ceyrek",
    label: "Çeyrek Altın",
    category: "coin",
    multiplier: 1.7548,
    inputUnit: "adet",
    caption: "~1.75g — 22 ayar ziynet sikke",
  },
  {
    id: "yarim",
    label: "Yarım Altın",
    category: "coin",
    multiplier: 3.5096,
    inputUnit: "adet",
    caption: "~3.50g — 22 ayar ziynet sikke",
  },
  {
    id: "tam",
    label: "Tam Altın",
    category: "coin",
    multiplier: 7.0192,
    inputUnit: "adet",
    caption: "~7.01g — 22 ayar ziynet sikke",
  },
  {
    id: "cumhuriyet",
    label: "Cumhuriyet Altını",
    category: "coin",
    multiplier: 7.216,
    inputUnit: "adet",
    caption: "7.216g — 22 ayar Cumhuriyet sikke",
  },
  {
    id: "ata",
    label: "Ata Altın",
    category: "coin",
    multiplier: 7.216,
    inputUnit: "adet",
    caption: "7.216g — 22 ayar Atatürk sikke",
  },
  {
    id: "gremse",
    label: "Gremse Altın",
    category: "coin",
    multiplier: 17.548,
    inputUnit: "adet",
    caption: "17.5g — Çeyrek × 10",
  },
  {
    id: "ziynet25",
    label: "Ziynet 2.5",
    category: "coin",
    multiplier: 17.548,
    inputUnit: "adet",
    caption: "17.5g ziynet",
  },
  {
    id: "besli",
    label: "Beşli Altın",
    category: "coin",
    multiplier: 36.08,
    inputUnit: "adet",
    caption: "~35g — Cumhuriyet × 5",
  },

  // ── Historical (with market spread) ──
  {
    id: "resat",
    label: "Reşat Altın",
    category: "historical",
    multiplier: 7.216,
    inputUnit: "adet",
    caption: "~7.216g + %3 piyasa makası",
    spreadPercent: 3,
  },
  {
    id: "hamit",
    label: "Hamit Altın",
    category: "historical",
    multiplier: 7.216,
    inputUnit: "adet",
    caption: "~7.216g + %5 piyasa makası",
    spreadPercent: 5,
  },
  {
    id: "kulplu",
    label: "Kulplu Reşat",
    category: "historical",
    multiplier: 7.216,
    inputUnit: "adet",
    caption: "~7.216g + %7 piyasa makası",
    spreadPercent: 7,
  },

  // ── Silver ──
  {
    id: "gumus_gr",
    label: "Gümüş (Gram)",
    category: "silver",
    multiplier: 1,
    inputUnit: "gram",
    caption: "Has gümüş gram fiyatı",
    isSilver: true,
  },
  {
    id: "gumus_ons",
    label: "Gümüş (ONS)",
    category: "silver",
    multiplier: TROY_OUNCE_GRAMS,
    inputUnit: "ons",
    caption: "1 Troy Ons = 31.1035 gram",
    isSilver: true,
  },
  {
    id: "gumus_kg",
    label: "Gümüş (KG)",
    category: "silver",
    multiplier: 1000,
    inputUnit: "kg",
    caption: "1 KG = 1000 gram has gümüş",
    isSilver: true,
  },
];

// ─── Helpers ───────────────────────────────────────────────────

export function getTypesByCategory(category: GoldCategory): MetalType[] {
  return METAL_TYPES.filter((t) => t.category === category);
}

export function getTypeById(id: string): MetalType | undefined {
  return METAL_TYPES.find((t) => t.id === id);
}

// ─── Central Calculation Function ──────────────────────────────

/**
 * Calculate the value of a metal type in a target currency.
 *
 * Formula:
 *   hasGramPrice = spotPricePerOunce / 31.1035
 *   unitPrice    = hasGramPrice × multiplier × (1 + spread%)
 *   totalPrice   = unitPrice × quantity × targetRate
 *
 * @param type                — Metal type definition with multiplier
 * @param quantity            — User-entered amount (grams, ounces, pieces, etc.)
 * @param xauPricePerOunceUSD — Spot gold price per troy ounce in USD
 * @param xagPricePerOunceUSD — Spot silver price per troy ounce in USD (null if unavailable)
 * @param targetCurrencyRate  — How many units of target currency per 1 USD
 * @returns Price in target currency, or null if required data is missing
 */
export function calculateGold(
  type: MetalType,
  quantity: number,
  xauPricePerOunceUSD: number | null,
  xagPricePerOunceUSD: number | null,
  targetCurrencyRate: number
): number | null {
  const spotPrice = type.isSilver ? xagPricePerOunceUSD : xauPricePerOunceUSD;
  if (spotPrice === null || spotPrice === undefined) return null;

  const hasGramPriceUSD = spotPrice / TROY_OUNCE_GRAMS;
  let unitPriceUSD = hasGramPriceUSD * type.multiplier;

  // Apply market spread for historical/premium coins
  if (type.spreadPercent) {
    unitPriceUSD *= 1 + type.spreadPercent / 100;
  }

  return unitPriceUSD * quantity * targetCurrencyRate;
}
