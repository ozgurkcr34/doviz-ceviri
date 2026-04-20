export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
}

// Major world currencies with Turkish labels — XAU/XAG excluded (handled by MetalCard)
export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "ABD Doları", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "TRY", name: "Türk Lirası", flag: "🇹🇷" },
  { code: "GBP", name: "İngiliz Sterlini", flag: "🇬🇧" },
  { code: "JPY", name: "Japon Yeni", flag: "🇯🇵" },
  { code: "CHF", name: "İsviçre Frangı", flag: "🇨🇭" },
  { code: "CAD", name: "Kanada Doları", flag: "🇨🇦" },
  { code: "AUD", name: "Avustralya Doları", flag: "🇦🇺" },
  { code: "CNY", name: "Çin Yuanı", flag: "🇨🇳" },
  { code: "INR", name: "Hindistan Rupisi", flag: "🇮🇳" },
  { code: "KRW", name: "Güney Kore Wonu", flag: "🇰🇷" },
  { code: "BRL", name: "Brezilya Reali", flag: "🇧🇷" },
  { code: "RUB", name: "Rus Rublesi", flag: "🇷🇺" },
  { code: "MXN", name: "Meksika Pesosu", flag: "🇲🇽" },
  { code: "ZAR", name: "Güney Afrika Randı", flag: "🇿🇦" },
  { code: "SEK", name: "İsveç Kronu", flag: "🇸🇪" },
  { code: "NOK", name: "Norveç Kronu", flag: "🇳🇴" },
  { code: "DKK", name: "Danimarka Kronu", flag: "🇩🇰" },
  { code: "PLN", name: "Polonya Zlotisi", flag: "🇵🇱" },
  { code: "CZK", name: "Çek Korunası", flag: "🇨🇿" },
  { code: "HUF", name: "Macar Forinti", flag: "🇭🇺" },
  { code: "RON", name: "Romen Leyi", flag: "🇷🇴" },
  { code: "BGN", name: "Bulgar Levası", flag: "🇧🇬" },
  { code: "ISK", name: "İzlanda Kronu", flag: "🇮🇸" },
  { code: "THB", name: "Tayland Bahtı", flag: "🇹🇭" },
  { code: "SGD", name: "Singapur Doları", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Doları", flag: "🇭🇰" },
  { code: "TWD", name: "Tayvan Doları", flag: "🇹🇼" },
  { code: "NZD", name: "Yeni Zelanda Doları", flag: "🇳🇿" },
  { code: "PHP", name: "Filipin Pesosu", flag: "🇵🇭" },
  { code: "IDR", name: "Endonezya Rupisi", flag: "🇮🇩" },
  { code: "MYR", name: "Malezya Ringgiti", flag: "🇲🇾" },
  { code: "VND", name: "Vietnam Dongu", flag: "🇻🇳" },
  { code: "AED", name: "BAE Dirhemi", flag: "🇦🇪" },
  { code: "SAR", name: "Suudi Riyali", flag: "🇸🇦" },
  { code: "QAR", name: "Katar Riyali", flag: "🇶🇦" },
  { code: "KWD", name: "Kuveyt Dinarı", flag: "🇰🇼" },
  { code: "BHD", name: "Bahreyn Dinarı", flag: "🇧🇭" },
  { code: "OMR", name: "Umman Riyali", flag: "🇴🇲" },
  { code: "EGP", name: "Mısır Lirası", flag: "🇪🇬" },
  { code: "ILS", name: "İsrail Şekeli", flag: "🇮🇱" },
  { code: "JOD", name: "Ürdün Dinarı", flag: "🇯🇴" },
  { code: "PKR", name: "Pakistan Rupisi", flag: "🇵🇰" },
  { code: "BDT", name: "Bangladeş Takası", flag: "🇧🇩" },
  { code: "NGN", name: "Nijerya Nairası", flag: "🇳🇬" },
  { code: "KES", name: "Kenya Şilini", flag: "🇰🇪" },
  { code: "GHS", name: "Gana Sedisi", flag: "🇬🇭" },
  { code: "ARS", name: "Arjantin Pesosu", flag: "🇦🇷" },
  { code: "CLP", name: "Şili Pesosu", flag: "🇨🇱" },
  { code: "COP", name: "Kolombiya Pesosu", flag: "🇨🇴" },
  { code: "PEN", name: "Peru Solu", flag: "🇵🇪" },
  { code: "UAH", name: "Ukrayna Grivnası", flag: "🇺🇦" },
  { code: "GEL", name: "Gürcistan Larisi", flag: "🇬🇪" },
  { code: "AZN", name: "Azerbaycan Manatı", flag: "🇦🇿" },
  { code: "KZT", name: "Kazakistan Tengesi", flag: "🇰🇿" },
  { code: "MAD", name: "Fas Dirhemi", flag: "🇲🇦" },
  { code: "TND", name: "Tunus Dinarı", flag: "🇹🇳" },
  { code: "DZD", name: "Cezayir Dinarı", flag: "🇩🇿" },
];

/** Currencies with 0 decimals in formatting */
const NO_DECIMAL = new Set([
  "JPY", "KRW", "VND", "IDR", "HUF", "CLP", "UZS", "LBP",
]);

export function formatNumber(value: number, currencyCode: string): string {
  if (NO_DECIMAL.has(currencyCode)) {
    return value.toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
