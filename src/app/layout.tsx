import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Döviz & Emtia Çevirici — Anlık Kur Hesaplama",
  description:
    "Para birimleri, altın türleri ve gümüş fiyatları arasında anlık çeviri. Has, 22K, 18K, 14K ayar ve çeyrek, yarım, tam, cumhuriyet gibi ziynet altınlarını hesaplayın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-neutral-900 font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
