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
  title: 'KGN Furniture and Props — Film & Production',
  description: 'Browse and book premium furniture and props for film, OTT and production. Sofas, chairs, tables, mirrors, racks and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${ibmPlexMono.variable} ${cormorant.variable}`}>
      <body className="font-sans bg-[#0A0A0F] text-[#F0F0F5] antialiased">
        <CartProvider>
          {children}
          <CartDrawer />
          <CartFab />
        </CartProvider>
      </body>
    </html>
  )
}
