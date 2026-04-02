import type { Metadata } from 'next'
import { DM_Sans, IBM_Plex_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import CartDrawer from '@/components/CartDrawer'
import CartFab from '@/components/CartFab'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Prop Rental for Film & OTT Production | KGN Furniture and Props — Mumbai',
  description: 'Furniture and prop rental for Bollywood, Netflix, and commercial shoots. 500+ catalogued pieces in Mumbai. Inspect before you book. Est. 1994.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'KGN Furniture and Props',
  description:
    'Prop rental for Bollywood, OTT, and commercial film productions. Furniture and period pieces for set design. Mumbai showroom, established 1994.',
  url: 'https://propvault-six.vercel.app',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Mumbai',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
  foundingDate: '1994',
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
    <html lang="en" className={`${dmSans.variable} ${ibmPlexMono.variable} ${cormorant.variable}`}>
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
