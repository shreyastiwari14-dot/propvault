'use client'
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion'
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

/* ── rAF-based animated counter ─────────────────────────────── */
function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || to === 0) return
    let raf: number
    const start = performance.now()
    const dur   = 1600
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

/* ── Card entrance variants ──────────────────────────────────── */
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.75, delay: i * 0.08, ease: EASE_EXPO },
  }),
}

/* ── Category tile ───────────────────────────────────────────── */
function CatTile({ cat, index }: { cat: Category; index: number }) {
  const isFirst = index === 0
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '200px' }}
      custom={index}
      className={isFirst ? 'sm:row-span-2' : ''}
    >
      <Link
        href={`/${cat.slug}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-[#0E0E1A] border border-[#1A1A2A] hover:border-[#C8902A]/30 transition-colors duration-500 h-full ${
          isFirst ? 'min-h-[380px] sm:min-h-0' : 'min-h-[240px] sm:min-h-0'
        }`}
      >
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          {cat.thumbnail ? (
            <Image
              src={cat.thumbnail}
              alt={cat.name}
              fill
              priority={isFirst}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-70 group-hover:opacity-90"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#111118] to-[#020206]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020206] via-[#020206]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C8902A] to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-6">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#555568]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] text-[#7070A0] bg-black/40 backdrop-blur-sm border border-[#2A2A3A] px-2.5 py-1 rounded-full">
              {cat.item_count ?? 0} pieces
            </span>
          </div>

          <div>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.5, duration: 0.6, ease: EASE_EXPO }}
              className="h-px w-8 bg-[#C8902A] origin-left mb-3"
            />
            <h3 className={`font-bold leading-tight text-[#F0F0F5] transition-colors group-hover:text-white ${
              isFirst ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
            }`} style={{ letterSpacing: '-0.02em' }}>
              {cat.name}
            </h3>
            <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-mono text-[10px] text-[#C8902A] uppercase tracking-[0.2em]">Browse</span>
              <svg width="12" height="12" fill="none" stroke="#C8902A" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Marquee ticker ──────────────────────────────────────────── */
const TICKER = [
  'Period Furniture', 'Contemporary Pieces', 'Art Deco', 'Rustic Farmhouse',
  'Inspection Before Booking', '500+ Items In Stock', 'Handpicked for Set',
  'Bollywood', 'OTT Production', 'Commercial Shoots', 'Mumbai Showroom',
  '30 Years of Set Craft', 'Chairs & Seating', 'Tables & Storage', 'Decorative Props',
]

function Marquee() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="overflow-hidden border-y border-[#1A1A2A] py-4" aria-hidden="true">
      <div className="flex gap-12 marquee-inner whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[#3A3A5A] shrink-0">
            {t}
            <span className="text-[#C8902A]">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── WhatsApp SVG ────────────────────────────────────────────── */
const WaIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

/* ══════════════════ MAIN COMPONENT ═══════════════════════════ */
export default function HomeClient({ categories, totalItems }: { categories: Category[]; totalItems: number }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  const heroY       = useTransform(scrollY, [0, 700], [0, -160])
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const orbY1       = useTransform(scrollY, [0, 800], [0, -100])
  const orbY2       = useTransform(scrollY, [0, 800], [0,  70])

  const visibleCats = categories.filter(c => c.slug !== 'miscellaneous')
  const miscCat     = categories.find(c => c.slug === 'miscellaneous')

  const STATS = [
    { to: 542, suffix: '', label: 'Props in Stock', isStatic: false },
    { to: 10,  suffix: '', label: 'Prop Categories', isStatic: false },
    { to: 30,  suffix: '+', label: 'Years of Set Craft', isStatic: true },
  ]

  return (
    <main className="min-h-screen bg-[#020206] overflow-x-hidden">

      {/* ══════════════════════════════ NAV ══════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5" aria-label="Main navigation">
        <div className="absolute inset-0 backdrop-blur-md bg-[#020206]/75 border-b border-white/[0.04]" aria-hidden="true" />
        <Link
          href="/"
          aria-label="KGN Furniture and Props — Home"
          className="relative font-mono text-xs text-[#F0F0F5] uppercase tracking-[0.3em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded"
        >
          KGN
        </Link>
        <div className="relative flex items-center gap-6">
          <a
            href="#catalogue"
            aria-label="Browse prop catalogue"
            className="hidden sm:block font-mono text-[10px] text-[#555568] uppercase tracking-[0.25em] hover:text-[#7070A0] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded"
          >
            Browse Props
          </a>
          <a
            href={WHATSAPP_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact KGN on WhatsApp"
            className="flex items-center gap-2 font-mono text-[11px] text-[#7070A0] hover:text-[#25D366] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2 rounded"
          >
            <WaIcon size={13} />
            Talk to Us
          </a>
        </div>
      </nav>

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Gradient orbs */}
        <motion.div
          style={{ y: orbY1, background: 'radial-gradient(circle, rgba(200,144,42,0.10) 0%, transparent 65%)' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <motion.div
          style={{ y: orbY2, background: 'radial-gradient(circle, rgba(60,30,90,0.12) 0%, transparent 65%)' }}
          className="absolute -bottom-20 -right-20 w-[700px] h-[700px] rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Structural grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden="true">
          <div className="absolute left-[15%] top-0 bottom-0 w-px bg-[#1A1A2A]" />
          <div className="absolute left-[85%] top-0 bottom-0 w-px bg-[#1A1A2A]" />
          <div className="absolute top-[25%] left-0 right-0 h-px bg-[#1A1A2A]" />
          <div className="absolute top-[75%] left-0 right-0 h-px bg-[#1A1A2A]" />
        </div>

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 px-6 sm:px-12 pt-24">

          {/* Eyebrow label — NOT a heading for correct H1 hierarchy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT }}
            className="font-mono text-[10px] text-[#C8902A] uppercase tracking-[0.4em] mb-10"
          >
            Prop Rental for Film &amp; OTT Production · Mumbai · Est. 1994
          </motion.p>

          {/* Brand display — KGN wordmark */}
          <div className="overflow-hidden mb-0">
            <motion.p
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EASE_EXPO }}
              className="font-extrabold leading-[0.85] text-[#F0F0F5]"
              style={{ fontSize: 'clamp(72px, 16vw, 220px)', letterSpacing: '-0.04em' }}
              aria-label="KGN"
            >
              KGN
            </motion.p>
          </div>

          {/* Primary H1 — the keyword-rich heading */}
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: EASE_EXPO }}
              className="font-bold leading-[0.85] text-[#4A4A6A]"
              style={{ fontSize: 'clamp(30px, 7vw, 96px)', letterSpacing: '-0.03em' }}
            >
              Furniture &amp; Props
            </motion.h1>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: EASE_EXPO }}
            className="h-px bg-gradient-to-r from-[#C8902A]/60 via-[#2A2A3A] to-transparent origin-left mb-8 max-w-xl"
            aria-hidden="true"
          />

          {/* Subheadline + CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7, ease: EASE_OUT }}
              className="text-[#7070A0] text-base sm:text-lg leading-relaxed max-w-xs"
              style={{ lineHeight: 1.65 }}
            >
              The Mumbai prop house for Indian cinema. 500+ pieces — available to inspect and collect from our showroom.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7, ease: EASE_OUT }}
              className="flex items-center gap-4"
            >
              <a
                href="#catalogue"
                className="group inline-flex items-center gap-3 bg-[#C8902A] hover:bg-[#D9A030] text-[#020206] font-semibold text-xs uppercase tracking-[0.1em] px-6 py-3.5 rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-4"
              >
                View the Inventory
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="#catalogue"
                className="font-mono text-[10px] text-[#3A3A5A] uppercase tracking-[0.25em] hover:text-[#7070A0] transition-colors"
                aria-label="Scroll down to explore"
              >
                Explore below
              </a>
            </motion.div>
          </div>

          {/* Ghost prop count — desktop only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="absolute top-32 right-6 sm:right-12 text-right hidden lg:block"
            aria-hidden="true"
          >
            <div className="font-extrabold text-[#1A1A2A] select-none" style={{ fontSize: 'clamp(80px, 12vw, 160px)', letterSpacing: '-0.04em' }}>
              542
            </div>
            <div className="font-mono text-[9px] text-[#2A2A3A] uppercase tracking-[0.3em]">Props Available</div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-5 h-8 border border-[#2A2A3A] rounded-full flex justify-center pt-1.5"
          >
            <div className="w-0.5 h-1.5 bg-[#C8902A] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════ MARQUEE ══════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════════ STATS ════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="px-6 sm:px-12 py-16 max-w-7xl mx-auto"
        aria-label="Key facts"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map(({ to, suffix, label, isStatic }) => (
            <div key={label} className="glass rounded-2xl p-5 sm:p-8 flex sm:flex-col items-center sm:items-center justify-between sm:justify-center gap-4 sm:gap-0 min-h-[80px]">
              <div className="font-extrabold text-[#F0F0F5]" style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.04em' }}>
                {isStatic ? `${to}${suffix}` : <Count to={to} suffix={suffix} />}
              </div>
              <div className="font-medium text-[#555568] uppercase tracking-[0.25em] text-[10px] sm:mt-1">{label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════ CATALOGUE ════════════════════════ */}
      <section id="catalogue" className="px-6 sm:px-12 pb-24 max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="font-medium text-[10px] text-[#C8902A] uppercase tracking-[0.35em] mb-3">Collections</p>
            <h2 className="font-bold text-[#F0F0F5]" style={{ fontSize: 'clamp(32px, 5vw, 60px)', letterSpacing: '-0.025em' }}>
              Browse by Prop Type
            </h2>
          </div>
          <span className="hidden sm:block font-mono text-[10px] text-[#333348] uppercase tracking-[0.25em]">
            {visibleCats.length} categories · 542+ pieces
          </span>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:auto-rows-[220px]">
          {visibleCats.map((cat, i) => (
            <CatTile key={cat.id} cat={cat} index={i} />
          ))}
        </div>

        {/* Miscellaneous — separate row */}
        {miscCat && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
            className="mt-4"
          >
            <Link
              href={`/${miscCat.slug}`}
              className="group flex items-center justify-between px-6 py-4 rounded-xl border border-[#1A1A2A] hover:border-[#2A2A3A] bg-[#090910] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-[#3A3A5A] uppercase tracking-[0.25em]">Other Pieces</span>
                <span className="font-mono text-[10px] text-[#2A2A4A] border border-[#1A1A2A] px-2 py-0.5 rounded-full">
                  {miscCat.item_count ?? 0} items
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#333348] group-hover:text-[#555568] transition-colors">View all →</span>
            </Link>
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════ ABOUT ════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="px-6 sm:px-12 py-24 max-w-7xl mx-auto"
        aria-labelledby="about-heading"
      >
        <div className="grid sm:grid-cols-2 gap-12 sm:gap-20 items-start">
          {/* Text column */}
          <div>
            <p className="font-medium text-[10px] text-[#C8902A] uppercase tracking-[0.35em] mb-4">About the Showroom</p>
            <h2
              id="about-heading"
              className="font-bold text-[#F0F0F5] leading-tight mb-6"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.025em' }}
            >
              Thirty years of knowing what a set needs.
            </h2>
            <p className="text-[#7070A0] text-sm sm:text-base leading-relaxed mb-4" style={{ lineHeight: 1.65 }}>
              KGN Furniture and Props has been supplying the Mumbai film industry since 1994. Our inventory spans five centuries of furniture styles — from colonial teak and Victorian upholstery to mid-century Scandinavian and contemporary minimalist pieces.
            </p>
            <p className="text-[#7070A0] text-sm sm:text-base leading-relaxed mb-8" style={{ lineHeight: 1.65 }}>
              Every item in our catalogue has been selected with a working set in mind: proportions that read well on camera, finishes that hold under professional lighting, and condition suitable for the rigours of a production schedule. Our Mumbai showroom is open to production designers, art directors, and set decorators by appointment.
            </p>
            {/* Trust callouts */}
            <div className="grid grid-cols-2 gap-3">
              {[
                '500+ catalogued pieces',
                'Showroom visits by appointment',
                'Mumbai-based since 1994',
                'Inspection before every booking',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#090910] border border-[#1A1A2A]">
                  <div className="w-1 h-1 rounded-full bg-[#C8902A] mt-1.5 shrink-0" aria-hidden="true" />
                  <span className="font-medium text-[10px] text-[#7070A0] uppercase tracking-[0.15em] leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEO copy column */}
          <div className="space-y-4">
            <div className="h-px bg-[#1A1A2A]" aria-hidden="true" />
            <p className="font-semibold text-[#3A3A5A] text-lg leading-relaxed" style={{ lineHeight: 1.65 }}>
              &ldquo;The working prop house for Indian cinema.&rdquo;
            </p>
            <div className="h-px bg-[#1A1A2A]" aria-hidden="true" />
            <p className="text-[#555568] text-sm leading-relaxed" style={{ lineHeight: 1.65 }}>
              KGN Furniture and Props is a Mumbai-based prop rental house serving the Indian film and television industry since 1994. Our catalogue spans 500+ catalogued pieces across furniture, decorative props, and period pieces — from Victorian and colonial teak to contemporary minimalist and mid-century designs. We work with production designers, art directors, and set decorators across Bollywood features, Netflix and Prime Video originals, and commercial advertising productions. Every piece is available for inspection at our Mumbai showroom.
            </p>
            <div className="pt-4">
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 font-medium text-[11px] uppercase tracking-[0.2em] text-[#7070A0] hover:text-[#C8902A] transition-colors"
              >
                <WaIcon size={13} />
                Schedule a showroom visit
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════ CONTACT ══════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="relative border-t border-[#0E0E1A] overflow-hidden"
        aria-labelledby="contact-heading"
      >
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none hidden sm:block"
          style={{ background: 'radial-gradient(circle, rgba(200,144,42,0.05) 0%, transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-20">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-start">
            <div>
              <p className="font-medium text-[10px] text-[#C8902A] uppercase tracking-[0.35em] mb-4">Get In Touch</p>
              <h2
                id="contact-heading"
                className="font-bold text-[#F0F0F5] leading-tight mb-4"
                style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.025em' }}
              >
                Looking for something specific?
              </h2>
              <p className="text-[#7070A0] text-sm leading-relaxed max-w-sm" style={{ lineHeight: 1.65 }}>
                Our showroom holds 500+ pieces — but our network goes deeper. If you don&rsquo;t see what your set requires, talk to us. We&rsquo;ve been sourcing for Indian productions since 1994.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* WhatsApp card */}
              <a
                href={WHATSAPP_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between px-6 py-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#25D366] focus-visible:outline-offset-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#25D366]"><WaIcon size={18} /></span>
                  <div>
                    <div className="font-semibold text-xs text-[#25D366]">WhatsApp the Showroom</div>
                    <div className="font-mono text-[10px] text-[#555568] mt-0.5">Usually replies within the hour · Visit by appointment</div>
                  </div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#25D366" strokeWidth="2" viewBox="0 0 24 24"
                  className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>

              {/* Book props card */}
              <Link
                href="/book"
                className="group flex items-center justify-between px-6 py-4 rounded-xl bg-[#0E0E1A] border border-[#1A1A2A] hover:border-[#C8902A]/30 hover:bg-[#C8902A]/5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8902A] focus-visible:outline-offset-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#C8902A]/10 border border-[#C8902A]/20 flex items-center justify-center shrink-0" aria-hidden="true">
                    <svg width="14" height="14" fill="none" stroke="#C8902A" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#D0D0E0]">Build Your Shortlist</div>
                    <div className="font-mono text-[10px] text-[#555568] mt-0.5">Select multiple pieces · We confirm availability</div>
                  </div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#555568" strokeWidth="2" viewBox="0 0 24 24"
                  className="group-hover:stroke-[#C8902A] transition-colors shrink-0" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-6 border-t border-[#0E0E1A]">
            <p className="font-semibold text-[#2A2A4A] text-sm mb-4">
              The working prop house for Indian cinema.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] font-mono text-[#2A2A4A] uppercase tracking-[0.2em]">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span>Mumbai, Maharashtra</span>
                <span>Film &amp; OTT Productions</span>
                <span>Showroom by Appointment</span>
              </div>
              <span>© {new Date().getFullYear()} KGN Furniture and Props</span>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
