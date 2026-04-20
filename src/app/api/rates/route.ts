import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  try {
    let url: string;

    if (apiKey && apiKey !== "YOUR_API_KEY") {
      // Use authenticated endpoint
      url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
    } else {
      // Fall back to open access (no key needed, rate-limited)
      url = `https://open.er-api.com/v6/latest/USD`;
    }

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`API yanıt hatası: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error(data["error-type"] || "Bilinmeyen API hatası");
    }

    return NextResponse.json({
      rates: data.rates || data.conversion_rates,
      lastUpdate: data.time_last_update_utc,
      nextUpdate: data.time_next_update_utc,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kurlar alınırken bir hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
