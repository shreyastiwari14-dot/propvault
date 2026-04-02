import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import CartDrawer from '@/components/CartDrawer'
import CartFab from '@/components/CartFab'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Prop Rental Mumbai | Film & OTT Props | KGN Furniture and Props',
  description: 'Furniture and prop rental for Bollywood, Netflix, and commercial shoots. 500+ catalogued pieces in Mumbai. Inspect before you book. Est. 1994.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'KGN Furniture and Props',
  description:
    'Prop rental for Bollywood, OTT, and commercial film productions. Furniture and period pieces for set design. Mumbai showroom, established 1994.',
  url: 'https://propvault-six.vercel.app',
  // TODO: Replace with actual telephone, street address, GPS coordinates
  address: {
    '@type': 'PostalAddress',
    streetAddress: '', // TODO: add actual street address
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '', // TODO: add actual postal code
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '', // TODO: add actual GPS latitude
    longitude: '', // TODO: add actual GPS longitude
  },
  foundingDate: '1994',
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 5,
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Prop & Furniture Rental Catalogue',
    description: '500+ catalogued furniture and prop pieces available for film, OTT, and commercial productions.',
  },
  keywords:
    'prop rental Mumbai, film props Mumbai, Bollywood prop rental, OTT production props, set decoration props, furniture rental film shoots',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Bank Transfer',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '18:00',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-[#020206] text-[#F0F0F5] antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
          <CartFab />
        </CartProvider>
      </body>
    </html>
  )
}
