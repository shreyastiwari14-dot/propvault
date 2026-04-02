import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import CartDrawer from '@/components/CartDrawer'
import CartFab from '@/components/CartFab'
import Navigation from '@/components/layout/Navigation'
import SmoothScroll from '@/components/layout/SmoothScroll'
import CustomCursor from '@/components/layout/CustomCursor'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Prop Rental Mumbai | Film & OTT Props | KGN Furniture and Props',
  description: 'Furniture and prop rental for Bollywood, Netflix, and commercial shoots. 500+ catalogued pieces in Mumbai. Inspect before you book. Est. 1994.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'KGN Furniture and Props',
  description: 'Prop rental for Bollywood, OTT, and commercial film productions. Furniture and period pieces for set design. Mumbai showroom, established 1994.',
  url: 'https://propvault-six.vercel.app',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: '', longitude: '' },
  foundingDate: '1994',
  numberOfEmployees: { '@type': 'QuantitativeValue', value: 5 },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Prop & Furniture Rental Catalogue',
    description: '500+ catalogued furniture and prop pieces available for film, OTT, and commercial productions.',
  },
  keywords: 'prop rental Mumbai, film props Mumbai, Bollywood prop rental, OTT production props, set decoration props, furniture rental film shoots',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Bank Transfer',
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '10:00',
    closes: '18:00',
  }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-[#050507] text-[#f0f0f5] antialiased">
        <SmoothScroll>
          <CartProvider>
            <Navigation />
            {children}
            <CartDrawer />
            <CartFab />
          </CartProvider>
        </SmoothScroll>
        <CustomCursor />
      </body>
    </html>
  )
}
