import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  try {
    // --- 1. Fetch currency rates (USD base) ---
    let currencyUrl: string;
    if (apiKey && apiKey !== "YOUR_API_KEY") {
      currencyUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    } else {
      currencyUrl = `https://open.er-api.com/v6/latest/USD`;
    }

    const currencyRes = await fetch(currencyUrl, {
      next: { revalidate: 3600 },
    });

    if (!currencyRes.ok) {
      throw new Error(`Döviz API hatası: ${currencyRes.status}`);
    }

    const currencyData = await currencyRes.json();

    if (currencyData.result !== "success") {
      throw new Error(
        currencyData["error-type"] || "Bilinmeyen döviz API hatası"
      );
    }

    const rates: Record<string, number> =
      currencyData.rates || currencyData.conversion_rates;

    // --- 2. Fetch gold price to inject XAU/XAG ---
    // fawazahmed0 currency-api: free, no key, includes metals
    // XAU base → "usd" gives gold price in USD per ounce
    try {
      const goldRes = await fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json",
        { next: { revalidate: 3600 } }
      );

      if (goldRes.ok) {
        const goldData = await goldRes.json();
        const xauRates = goldData?.xau;

        if (xauRates?.usd) {
          // Gold: 1 XAU (ounce) = xauRates.usd USD
          // To match our format (how many XAU per 1 USD): 1 / xauRates.usd
          rates["XAU"] = 1 / xauRates.usd;
        }

        if (xauRates?.xag) {
          // xauRates.xag = how many ounces of silver per 1 ounce of gold
          // So 1 oz silver in USD = xauRates.usd / xauRates.xag
          const silverPriceUSD = xauRates.usd / xauRates.xag;
          rates["XAG"] = 1 / silverPriceUSD;
        }
      }
    } catch {
      // Metal prices unavailable — the UI handles this gracefully
      console.warn("Metal price fetch failed, continuing without XAU/XAG");
    }

    return NextResponse.json({
      rates,
      lastUpdate: currencyData.time_last_update_utc,
      nextUpdate: currencyData.time_next_update_utc,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Kurlar alınırken bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
