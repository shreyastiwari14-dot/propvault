'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { WHATSAPP_BASE_URL } from '@/lib/config'

const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const NAV_LINKS = [
  { label: 'Catalog', href: '#catalogue' },
  { label: 'About', href: '#about' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3 bg-[#050507]/90 backdrop-blur-xl border-b border-white/[0.05]' : 'py-5 bg-transparent'
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="KGN Furniture and Props — Home"
            className="font-display font-bold text-sm text-[#f0f0f5] uppercase tracking-[0.3em] relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-2 rounded"
          >
            KGN
            <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#00e5c7] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-[11px] text-[#555570] uppercase tracking-[0.25em] hover:text-[#8888a0] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-2 rounded"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: WhatsApp + hamburger */}
          <div className="flex items-center gap-4">
            <a
              href={WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact KGN on WhatsApp"
              className="hidden sm:flex items-center gap-2 font-sans text-[11px] text-[#555570] uppercase tracking-[0.2em] border border-white/[0.08] hover:border-[#00e5c7]/40 hover:text-[#00e5c7] px-4 py-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-2"
            >
              <WaIcon />
              Talk to Us
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="sm:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-2 rounded"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={`block h-px w-6 bg-[#f0f0f5] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
              <span className={`block h-px w-4 bg-[#f0f0f5] self-end transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-6 bg-[#f0f0f5] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#050507]/95 backdrop-blur-xl flex flex-col justify-center px-8"
            onClick={() => setMenuOpen(false)}
          >
            <div className="space-y-6" onClick={e => e.stopPropagation()}>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block font-display font-bold text-4xl text-[#f0f0f5] tracking-tight"
              >
                Home
              </Link>
              <a
                href="#catalogue"
                onClick={() => setMenuOpen(false)}
                className="block font-display font-bold text-4xl text-[#f0f0f5] tracking-tight"
              >
                Catalog
              </a>
              <a
                href="#about"
                onClick={() => setMenuOpen(false)}
                className="block font-display font-bold text-4xl text-[#f0f0f5] tracking-tight"
              >
                About
              </a>
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-3 mt-4 font-sans text-sm text-[#00e5c7] border border-[#00e5c7]/30 px-6 py-3 rounded-full"
              >
                <WaIcon />
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp button (mobile) */}
      <a
        href={WHATSAPP_BASE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact KGN on WhatsApp"
        className="sm:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#25D366] focus-visible:outline-offset-2"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </>
  )
}
