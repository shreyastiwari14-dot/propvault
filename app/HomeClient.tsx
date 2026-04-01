'use client'
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  item_count: number | null
  thumbnail: string | null
}

const EASE_EXPO = [0.76, 0, 0.24, 1] as [number, number, number, number]
const EASE_OUT  = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

/* ── Animated number ─────────────────────────────────────────── */
function Count({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref  = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let raf: number
    const start = performance.now()
    const dur   = 1600
    const tick  = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ── Category card variants ──────────────────────────────────── */
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.75, delay: i * 0.08, ease: EASE_EXPO },
  }),
}

/* ── Single category tile ────────────────────────────────────── */
function CatTile({ cat, index }: { cat: Category; index: number }) {
  const isFirst = index === 0
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      custom={index}
      className={isFirst ? 'sm:row-span-2' : ''}
    >
      <Link
        href={`/${cat.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#0E0E1A] border border-[#1A1A2A] hover:border-[#E94560]/30 transition-colors duration-500 h-full"
      >
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          {cat.thumbnail ? (
            <Image
              src={cat.thumbnail}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-70 group-hover:opacity-90"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#111118] to-[#0A0A0F]" />
          )}
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030307] via-[#030307]/50 to-transparent" />
          {/* hover accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E94560] to-transparent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-6">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#555568]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] text-[#8888A0] bg-black/40 backdrop-blur-sm border border-[#2A2A3A] px-2.5 py-1 rounded-full">
              {cat.item_count ?? 0} props
            </span>
          </div>

          <div>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 + 0.5, duration: 0.6, ease: EASE_EXPO }}
              className="h-px w-8 bg-[#E94560] origin-left mb-3"
            />
            <h3 className={`font-display font-light leading-tight text-[#F0F0F5] transition-colors group-hover:text-white ${isFirst ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
              {cat.name}
            </h3>
            <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.2em]">Browse</span>
              <svg width="12" height="12" fill="none" stroke="#E94560" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Horizontal marquee strip ────────────────────────────────── */
const MARQUEE_ITEMS = [
  'Film Production', 'OTT Content', 'Commercial Shoots',
  'Set Design', 'Art Direction', 'Premium Props', 'Period Furniture',
  '30 Years Experience', 'Mumbai', 'Bollywood',
]

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="overflow-hidden border-y border-[#1A1A2A] py-4 relative">
      <div className="flex gap-12 marquee-inner whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[#555568] shrink-0">
            {t}
            <span className="text-[#E94560]">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────── */
export default function HomeClient({ categories, totalItems }: { categories: Category[]; totalItems: number }) {
  const heroRef   = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // Scroll parallax transforms
  const heroY       = useTransform(scrollY, [0, 700], [0, -180])
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const orbY1       = useTransform(scrollY, [0, 800], [0, -120])
  const orbY2       = useTransform(scrollY, [0, 800], [0,  80])

  // Filter out miscellaneous
  const visibleCats = categories.filter(c => c.slug !== 'miscellaneous')
  const miscCat     = categories.find(c => c.slug === 'miscellaneous')

  return (
    <main className="min-h-screen bg-[#030307] overflow-x-hidden">

      {/* ══════════════════════════════ NAV ══════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5">
        {/* glass pill */}
        <div className="absolute inset-0 backdrop-blur-md bg-[#030307]/60 border-b border-white/[0.04]" />

        <Link href="/" className="relative font-mono text-xs text-[#F0F0F5] uppercase tracking-[0.3em]">
          KGN
        </Link>

        <div className="relative flex items-center gap-6">
          <a href="#catalogue" className="hidden sm:block font-mono text-[10px] text-[#555568] uppercase tracking-[0.25em] hover:text-[#8888A0] transition-colors">
            Catalogue
          </a>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919999999999'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-[11px] text-[#8888A0] hover:text-[#25D366] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Enquire
          </a>
        </div>
      </nav>

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* ── Gradient orbs ── */}
        <motion.div
          style={{ y: orbY1, background: 'radial-gradient(circle, rgba(233,69,96,0.12) 0%, transparent 65%)' }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        />
        <motion.div
          style={{ y: orbY2, background: 'radial-gradient(circle, rgba(74,26,170,0.1) 0%, transparent 65%)' }}
          className="absolute -bottom-20 -right-20 w-[700px] h-[700px] rounded-full pointer-events-none"
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.04) 0%, transparent 70%)' }} />

        {/* ── Grid lines ── */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute left-[15%] top-0 bottom-0 w-px bg-[#1A1A2A]" />
          <div className="absolute left-[85%] top-0 bottom-0 w-px bg-[#1A1A2A]" />
          <div className="absolute top-[25%] left-0 right-0 h-px bg-[#1A1A2A]" />
          <div className="absolute top-[75%] left-0 right-0 h-px bg-[#1A1A2A]" />
        </div>

        {/* ── Hero content (parallax on scroll) ── */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 px-6 sm:px-12 pt-24">

          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE_OUT }}
            className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.4em] mb-10"
          >
            Film & Production · Mumbai · Est. 1994
          </motion.p>

          {/* KGN */}
          <div className="overflow-hidden mb-0">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EASE_EXPO }}
              className="font-display font-light leading-[0.85] tracking-[-0.02em] text-[#F0F0F5]"
              style={{ fontSize: 'clamp(96px, 18vw, 220px)' }}
            >
              KGN
            </motion.h1>
          </div>

          {/* Furniture & Props */}
          <div className="overflow-hidden mb-8">
            <motion.h2
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.35, ease: EASE_EXPO }}
              className="font-display font-light leading-[0.85] tracking-[-0.01em] text-[#4A4A6A] italic"
              style={{ fontSize: 'clamp(40px, 7.5vw, 96px)' }}
            >
              Furniture & Props
            </motion.h2>
          </div>

          {/* Divider line reveal */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: EASE_EXPO }}
            className="h-px bg-gradient-to-r from-[#E94560]/60 via-[#2A2A3A] to-transparent origin-left mb-8 max-w-xl"
          />

          {/* Subtitle + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7, ease: EASE_OUT }}
              className="text-[#7070A0] text-base sm:text-lg leading-relaxed max-w-xs"
            >
              Premium props for Bollywood,<br />OTT & commercial productions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7, ease: EASE_OUT }}
              className="flex items-center gap-4"
            >
              <a
                href="#catalogue"
                className="group inline-flex items-center gap-3 bg-[#E94560] hover:bg-[#FF5570] text-white font-mono text-xs uppercase tracking-[0.15em] px-6 py-3.5 rounded-full transition-colors duration-300"
              >
                Browse Catalogue
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a
                href="#catalogue"
                className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.25em] hover:text-[#8888A0] transition-colors"
              >
                ↓ scroll
              </a>
            </motion.div>
          </div>

          {/* Floating item count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="absolute top-32 right-6 sm:right-12 text-right"
          >
            <div className="font-display font-light text-[#1A1A2A] select-none" style={{ fontSize: 'clamp(80px, 12vw, 160px)' }}>
              <Count to={totalItems} />
            </div>
            <div className="font-mono text-[9px] text-[#2A2A4A] uppercase tracking-[0.3em]">Props Available</div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator dot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-5 h-8 border border-[#2A2A3A] rounded-full flex justify-center pt-1.5"
          >
            <div className="w-0.5 h-1.5 bg-[#E94560] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════ MARQUEE ══════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════════ STATS ══════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className="px-6 sm:px-12 py-16 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-3 gap-4">
          {[
            { to: totalItems, suffix: '', label: 'Total Props' },
            { to: visibleCats.length, suffix: '', label: 'Categories' },
            { to: 30, suffix: '+', label: 'Years' },
          ].map(({ to, suffix, label }) => (
            <div key={label} className="glass rounded-2xl p-6 sm:p-8 text-center">
              <div className="font-display font-light text-[#F0F0F5] mb-1" style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}>
                <Count to={to} suffix={suffix} />
              </div>
              <div className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.25em]">{label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════ CATALOGUE ══════════════════════════ */}
      <section id="catalogue" className="px-6 sm:px-12 pb-32 max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.35em] mb-3">Collections</p>
            <h2 className="font-display font-light italic text-[#F0F0F5]" style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>
              Browse by Category
            </h2>
          </div>
          <span className="hidden sm:block font-mono text-[10px] text-[#333348] uppercase tracking-[0.25em]">
            {visibleCats.length} collections
          </span>
        </motion.div>

        {/* Bento grid — first category spans 2 rows on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:auto-rows-[220px]">
          {visibleCats.map((cat, i) => (
            <CatTile key={cat.id} cat={cat} index={i} />
          ))}
        </div>

        {/* Miscellaneous — separate, subtle row at bottom */}
        {miscCat && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
            className="mt-6"
          >
            <Link
              href={`/${miscCat.slug}`}
              className="group flex items-center justify-between px-6 py-4 rounded-xl border border-[#1A1A2A] hover:border-[#2A2A3A] bg-[#08080F] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-[#333348] uppercase tracking-[0.25em]">
                  Miscellaneous
                </span>
                <span className="font-mono text-[10px] text-[#2A2A4A] border border-[#1A1A2A] px-2 py-0.5 rounded-full">
                  {miscCat.item_count ?? 0} props
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#333348] group-hover:text-[#555568] transition-colors">Browse →</span>
            </Link>
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════ CONTACT ══════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="relative border-t border-[#0E0E1A] overflow-hidden"
      >
        {/* Background orb */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.06) 0%, transparent 65%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-20">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.35em] mb-4">Get In Touch</p>
              <h3 className="font-display font-light italic text-[#F0F0F5] leading-tight mb-4"
                style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
                Need something<br />specific?
              </h3>
              <p className="text-[#7070A0] text-sm leading-relaxed max-w-sm">
                We source, customise, and deliver premium props across India.
                Talk to us directly for special requirements.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919999999999'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between px-6 py-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  <div>
                    <div className="font-mono text-xs text-[#25D366] font-medium">WhatsApp Us</div>
                    <div className="font-mono text-[10px] text-[#555568]">Fastest response</div>
                  </div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#25D366" strokeWidth="2" viewBox="0 0 24 24"
                  className="opacity-50 group-hover:opacity-100 transition-opacity">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>

              <Link
                href="/book"
                className="group flex items-center justify-between px-6 py-4 rounded-xl bg-[#0E0E1A] border border-[#1A1A2A] hover:border-[#E94560]/30 hover:bg-[#E94560]/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E94560]/10 border border-[#E94560]/20 flex items-center justify-center">
                    <svg width="14" height="14" fill="none" stroke="#E94560" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#D0D0E0] font-medium">Book Props</div>
                    <div className="font-mono text-[10px] text-[#555568]">Multi-item selection</div>
                  </div>
                </div>
                <svg width="14" height="14" fill="none" stroke="#555568" strokeWidth="2" viewBox="0 0 24 24"
                  className="group-hover:stroke-[#E94560] transition-colors">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer strip */}
          <div className="mt-16 pt-6 border-t border-[#0E0E1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] font-mono text-[#2A2A4A] uppercase tracking-[0.2em]">
            <div className="flex items-center gap-6">
              <span>Mumbai, Maharashtra</span>
              <span>Film & OTT Productions</span>
            </div>
            <div className="flex items-center gap-6">
              <span>© {new Date().getFullYear()} KGN Furniture and Props</span>
              <Link href="/admin" className="hover:text-[#555568] transition-colors">admin ↗</Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
