'use client'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { WHATSAPP_BASE_URL } from '@/lib/config'

interface Category {
  id: string
  name: string
  slug: string
  item_count: number | null
  thumbnail: string | null
}

const EASE_EXPO = [0.76, 0, 0.24, 1] as [number, number, number, number]
const EASE_OUT  = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

/* ── Animated counter ── */
function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || to === 0) return
    let raf: number
    const start = performance.now()
    const dur   = 1800
    const tick  = (now: number) => {
      const p    = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])

  return <span ref={ref}>{val > 0 ? val.toLocaleString() : to.toLocaleString()}{suffix}</span>
}

/* ── WhatsApp icon ── */
const WaIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

/* ── Bento category tile ── */
function CatTile({ cat, index }: { cat: Category; index: number }) {
  // Grid span logic for bento layout
  const getGridClass = (i: number) => {
    if (i === 0) return 'sm:col-span-3 sm:row-span-2'
    if (i === 1) return 'sm:col-span-3 sm:row-span-2'
    return 'sm:col-span-2'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '100px' }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: EASE_EXPO }}
      className={getGridClass(index)}
    >
      <Link
        href={`/${cat.slug}`}
        data-cursor="view"
        className={`group relative flex overflow-hidden rounded-xl bg-[#0a0a0f] border border-white/[0.06] hover:border-[#00e5c7]/30 transition-all duration-500 h-full ${
          index < 2 ? 'min-h-[300px] sm:min-h-0' : 'min-h-[200px]'
        }`}
      >
        {/* Image layer */}
        <div className="absolute inset-0 overflow-hidden">
          {cat.thumbnail ? (
            <Image
              src={cat.thumbnail}
              alt={cat.name}
              fill
              priority={index < 2}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-60 group-hover:opacity-80"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0d0d1a] to-[#050507]" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-transparent" />
          {/* Accent bottom line on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#00e5c7] to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-5 sm:p-6">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#555570]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] text-[#8888a0] bg-black/50 backdrop-blur-sm border border-white/[0.06] px-2.5 py-1 rounded-full">
              {cat.item_count ?? 0}
            </span>
          </div>

          <div>
            <div className="h-px w-6 bg-[#00e5c7] mb-3 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
            <h3 className={`font-display font-bold leading-tight text-[#f0f0f5] transition-colors group-hover:text-white ${
              index < 2 ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
            }`} style={{ letterSpacing: '-0.02em' }}>
              {cat.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-mono text-[10px] text-[#00e5c7] uppercase tracking-[0.2em]">Browse</span>
              <svg width="10" height="10" fill="none" stroke="#00e5c7" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Marquee ticker ── */
const TICKER = [
  'Period Furniture', 'Contemporary Pieces', 'Art Deco', 'Rustic Farmhouse',
  'Inspection Before Booking', '542+ Items In Stock', 'Handpicked for Set',
  'Bollywood', 'OTT Production', 'Commercial Shoots', 'Mumbai Showroom',
  '30 Years of Set Craft', 'Chairs & Seating', 'Tables & Storage',
]

function Marquee() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="overflow-hidden border-y border-white/[0.04] py-4 my-0" aria-hidden="true">
      <div className="flex gap-10 marquee-inner whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#333348] shrink-0">
            {t}
            <span className="text-[#00e5c7] opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════ MAIN COMPONENT ═══════════════════════════ */
export default function HomeClient({ categories, totalItems }: { categories: Category[]; totalItems: number }) {
  const { scrollY } = useScroll()
  const heroY       = useTransform(scrollY, [0, 600], [0, -120])
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const orbY1       = useTransform(scrollY, [0, 800], [0, -80])
  const orbY2       = useTransform(scrollY, [0, 800], [0, 60])

  const visibleCats = categories.filter(c => c.slug !== 'miscellaneous')

  const STATS = [
    { to: 542, suffix: '+', label: 'Props in Stock' },
    { to: 12,  suffix: '',  label: 'Categories' },
    { to: 30,  suffix: '+', label: 'Years in Film' },
    { to: 1000, suffix: '+', label: 'Productions' },
  ]

  // Suppress unused variable warning
  void totalItems

  return (
    <main className="min-h-screen bg-[#050507] overflow-x-hidden">

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          style={{ y: orbY1, background: 'radial-gradient(circle, rgba(0,229,199,0.08) 0%, transparent 60%)' }}
          className="absolute top-0 left-0 w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
          aria-hidden="true"
        />
        <motion.div
          style={{ y: orbY2, background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 60%)' }}
          className="absolute bottom-0 right-0 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full pointer-events-none translate-x-1/4 translate-y-1/4"
          aria-hidden="true"
        />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-[10%] top-0 bottom-0 w-px bg-white/[0.03]" />
          <div className="absolute left-[90%] top-0 bottom-0 w-px bg-white/[0.03]" />
        </div>

        {/* Vertical text — desktop only */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3" aria-hidden="true">
          <div className="w-px h-16 bg-white/[0.06]" />
          <span className="font-mono text-[9px] text-[#1a1a2a] uppercase tracking-[0.4em]" style={{ writingMode: 'vertical-rl' }}>
            Est · 1994 · Mumbai
          </span>
          <div className="w-px h-16 bg-white/[0.06]" />
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 px-6 sm:px-12 pt-28 sm:pt-24 pb-16"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE_OUT }}
            className="font-mono text-[10px] sm:text-xs text-[#00e5c7]/70 uppercase tracking-[0.5em] mb-8"
          >
            Mumbai&apos;s Premier Prop House
          </motion.p>

          {/* Headline */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.0, delay: 0.2, ease: EASE_EXPO }}
              className="font-display font-bold leading-[0.92] text-[#f0f0f5] uppercase"
              style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
            >
              Props That Make
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.p
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.0, delay: 0.3, ease: EASE_EXPO }}
              className="font-display font-bold leading-[0.92] text-[#00e5c7] uppercase"
              style={{ fontSize: 'clamp(3rem, 9vw, 7.5rem)', letterSpacing: '-0.03em' }}
            >
              Scenes Iconic
            </motion.p>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.8, ease: EASE_EXPO }}
            className="h-px bg-gradient-to-r from-[#00e5c7]/40 via-white/10 to-transparent origin-left mb-8 max-w-lg"
            aria-hidden="true"
          />

          {/* Sub + CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.7, ease: EASE_OUT }}
              className="text-[#8888a0] text-base sm:text-lg max-w-sm leading-relaxed"
              style={{ lineHeight: 1.65 }}
            >
              542+ curated furniture pieces for film, television and advertising productions. Inspect before you book.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7, ease: EASE_OUT }}
              className="flex flex-wrap items-center gap-3 shrink-0"
            >
              <a
                href="#catalogue"
                className="group inline-flex items-center gap-3 bg-[#00e5c7] hover:bg-[#00ffdd] text-[#050507] font-sans font-semibold text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-4"
              >
                Browse Catalog
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 border border-[#00e5c7]/30 hover:border-[#00e5c7]/60 text-[#00e5c7] font-sans font-medium text-[11px] uppercase tracking-[0.12em] px-5 py-3.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-4"
              >
                <WaIcon size={12} />
                WhatsApp Us
              </a>
            </motion.div>
          </div>

          {/* Ghost number — desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1.2 }}
            className="absolute top-24 right-16 text-right hidden lg:block select-none pointer-events-none"
            aria-hidden="true"
          >
            <div className="font-display font-bold text-[#0d0d1a]" style={{ fontSize: 'clamp(80px, 12vw, 180px)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              542
            </div>
            <div className="font-mono text-[9px] text-[#1a1a2a] uppercase tracking-[0.3em]">props available</div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-5 h-8 border border-white/10 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-0.5 h-2 bg-[#00e5c7] rounded-full opacity-60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ MARQUEE ══════ */}
      <Marquee />

      {/* ══════ STATS ══════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="px-6 sm:px-12 py-14 max-w-7xl mx-auto"
        aria-label="Key facts about KGN"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
          {STATS.map(({ to, suffix, label }) => (
            <div key={label} className="bg-[#050507] px-5 sm:px-8 py-6 sm:py-8 flex flex-col">
              <div className="font-mono font-bold text-[#00e5c7]" style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', letterSpacing: '-0.03em' }}>
                <Count to={to} suffix={suffix} />
              </div>
              <div className="font-sans text-[11px] text-[#555570] uppercase tracking-[0.2em] mt-1.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════ CATALOGUE ══════ */}
      <section id="catalogue" className="px-6 sm:px-12 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="font-mono text-[10px] text-[#00e5c7] uppercase tracking-[0.35em] mb-3">Collections</p>
            <h2 className="font-display font-bold text-[#f0f0f5]" style={{ fontSize: 'clamp(28px, 5vw, 56px)', letterSpacing: '-0.025em' }}>
              Browse by Prop Type
            </h2>
          </div>
          <span className="hidden sm:block font-mono text-[10px] text-[#333348] uppercase tracking-[0.2em]">
            {visibleCats.length} categories
          </span>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:auto-rows-[180px]">
          {visibleCats.map((cat, i) => (
            <CatTile key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </section>

      {/* ══════ ABOUT ══════ */}
      <motion.section
        id="about"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="px-6 sm:px-12 py-24 max-w-7xl mx-auto border-t border-white/[0.04]"
        aria-labelledby="about-heading"
      >
        <div className="grid sm:grid-cols-2 gap-12 sm:gap-20 items-start">
          <div>
            <p className="font-mono text-[10px] text-[#00e5c7] uppercase tracking-[0.35em] mb-5">About the Showroom</p>
            <h2
              id="about-heading"
              className="font-display font-bold text-[#f0f0f5] leading-tight mb-6"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.025em' }}
            >
              Thirty years of knowing what a set needs.
            </h2>
            <p className="text-[#8888a0] text-sm sm:text-base leading-relaxed mb-4" style={{ lineHeight: 1.7 }}>
              KGN Furniture and Props has been supplying the Mumbai film industry since 1994. Our inventory spans five centuries of furniture styles — from colonial teak and Victorian upholstery to mid-century Scandinavian and contemporary minimalist pieces.
            </p>
            <p className="text-[#8888a0] text-sm sm:text-base leading-relaxed mb-8" style={{ lineHeight: 1.7 }}>
              Every item has been selected with a working set in mind. Our Mumbai showroom is open to production designers, art directors, and set decorators by appointment.
            </p>
            <a
              href={WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 font-sans font-medium text-[11px] uppercase tracking-[0.2em] text-[#8888a0] hover:text-[#00e5c7] transition-colors"
            >
              <WaIcon size={13} />
              Schedule a showroom visit
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '◈', title: '500+', sub: 'Catalogued pieces' },
              { icon: '◉', title: '30+', sub: 'Years in the industry' },
              { icon: '◎', title: 'Inspection', sub: 'Before every booking' },
              { icon: '◍', title: 'Mumbai', sub: 'Showroom by appointment' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="glass rounded-xl p-5">
                <div className="font-mono text-[#00e5c7] text-lg mb-3">{icon}</div>
                <div className="font-display font-bold text-[#f0f0f5] text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{title}</div>
                <div className="font-sans text-[11px] text-[#555570] uppercase tracking-[0.15em] leading-relaxed">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════ CONTACT CTA ══════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="relative border-t border-white/[0.04] overflow-hidden"
        aria-labelledby="contact-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0f]/30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="font-mono text-[10px] text-[#00e5c7] uppercase tracking-[0.35em] mb-5">Get In Touch</p>
            <h2
              id="contact-heading"
              className="font-display font-bold text-[#f0f0f5] leading-tight mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 64px)', letterSpacing: '-0.03em' }}
            >
              Ready to dress your set?
            </h2>
            <p className="text-[#8888a0] text-base leading-relaxed mb-8" style={{ lineHeight: 1.65 }}>
              Our showroom holds 500+ pieces. If you don&rsquo;t see what your set requires, talk to us — we&rsquo;ve been sourcing for Indian productions since 1994.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20c55e] text-white font-sans font-semibold text-[11px] uppercase tracking-[0.12em] px-8 py-4 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#25D366] focus-visible:outline-offset-4"
              >
                <WaIcon size={14} />
                WhatsApp the Showroom
              </a>
              <Link
                href="/book"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-[#00e5c7]/30 hover:border-[#00e5c7]/60 hover:bg-[#00e5c7]/5 text-[#00e5c7] font-sans font-semibold text-[11px] uppercase tracking-[0.12em] px-8 py-4 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5c7] focus-visible:outline-offset-4"
              >
                Build Your Shortlist
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-display font-semibold text-[#1a1a2a] text-sm" style={{ letterSpacing: '-0.01em' }}>
              The working prop house for Indian cinema.
            </p>
            <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-[#1a1a2a] uppercase tracking-[0.2em]">
              <span>Mumbai, Maharashtra</span>
              <span>Est. 1994</span>
              <span>© {new Date().getFullYear()} KGN</span>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
