import type { Metadata } from "next";
import { Outfit, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import { PropListProvider } from "@/components/PropListContext";
import PropListDrawer from "@/components/PropListDrawer";
import PropListFab from "@/components/PropListFab";
import SmoothScroll from "@/components/SmoothScroll";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KGN Furniture & Props — Mumbai's Premier Prop House",
  description:
    "Browse and book premium furniture and props for film, OTT, and commercial productions in Mumbai. 542+ curated pieces, same-day availability.",
  keywords: [
    "prop rental Mumbai",
    "film props India",
    "Bollywood furniture rental",
    "OTT production props",
    "KGN Ceramica",
    "set design Mumbai",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "KGN Ceramica Furniture & Props",
              description:
                "Premium furniture and props for film, television, and advertising productions in Mumbai.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Mumbai",
                addressRegion: "Maharashtra",
                addressCountry: "IN",
              },
              foundingDate: "1994",
              openingHours: "Mo-Sa 10:00-18:00",
              keywords:
                "prop rental, Bollywood, OTT, commercial shoots, furniture rental Mumbai",
            }),
          }}
        />
      </head>
      <body className="font-sans bg-void text-text-primary antialiased">
        <SmoothScroll>
          <PropListProvider>
            <Navigation />
            {children}
            <PropListDrawer />
            <PropListFab />
          </PropListProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
