export const TROY_OUNCE_GRAMS = 31.1035;

export interface MetalUnit {
  id: string;
  label: string;
  /** How many grams this unit represents */
  grams: number;
}

export const GOLD_UNITS: MetalUnit[] = [
  { id: "gram", label: "Gram", grams: 1 },
  { id: "ceyrek", label: "Çeyrek Altın", grams: 1.75 },
  { id: "yarim", label: "Yarım Altın", grams: 3.5 },
  { id: "tam", label: "Tam Altın", grams: 7.0 },
];

export const SILVER_UNITS: MetalUnit[] = [
  { id: "gram", label: "Gram", grams: 1 },
  { id: "ons", label: "Ons (Troy)", grams: TROY_OUNCE_GRAMS },
];

export type MetalType = "gold" | "silver";

/**
 * Calculate the price of a metal quantity in a target currency.
 *
 * @param pricePerOunceUSD — Market price of 1 troy ounce in USD
 * @param quantity          — How many units the user wants
 * @param unit              — The unit type (gram, çeyrek, etc.)
 * @param targetRate        — Exchange rate: how many target-currency per 1 USD
 */
export function calculateMetalValue(
  pricePerOunceUSD: number,
  quantity: number,
  unit: MetalUnit,
  targetRate: number
): number {
  const pricePerGramUSD = pricePerOunceUSD / TROY_OUNCE_GRAMS;
  const totalGrams = quantity * unit.grams;
  const totalUSD = totalGrams * pricePerGramUSD;
  return totalUSD * targetRate;
}
