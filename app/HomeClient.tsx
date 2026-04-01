'use client'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

interface Category {
  id: string
  name: string
  slug: string
  item_count: number | null
  thumbnail: string | null
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
const EASE_SHARP = [0.76, 0, 0.24, 1] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.07, ease: EASE_OUT }
  }),
}

const clipReveal: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.1, ease: EASE_SHARP } },
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function HomeClient({ categories, totalItems }: { categories: Category[]; totalItems: number }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <main className="min-h-screen bg-[#0A0A0F] overflow-x-hidden">
      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 py-4">
        <Link href="/" className="font-mono text-xs text-[#8888A0] uppercase tracking-[0.2em] hover:text-[#F0F0F5] transition-colors">
          KGN
        </Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-xs text-[#8888A0] hover:text-[#25D366] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Enquire
        </a>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-end pb-16 px-6 sm:px-10">
        {/* Background grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[20%] top-0 bottom-0 w-px bg-[#1A1A2A]" />
          <div className="absolute left-[80%] top-0 bottom-0 w-px bg-[#1A1A2A]" />
          <div className="absolute top-[30%] left-0 right-0 h-px bg-[#1A1A2A]" />
        </div>

        {/* Prop count — top right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute top-24 right-6 sm:right-10 text-right"
        >
          <div className="font-display text-6xl font-light text-[#1E1E2E] select-none">
            <AnimatedCounter target={totalItems} />
          </div>
          <div className="font-mono text-[10px] text-[#333348] uppercase tracking-[0.25em] mt-1">Props Available</div>
        </motion.div>

        {/* Main heading */}
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.35em] mb-8"
          >
            Film & Production · Mumbai
          </motion.p>

          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: '110%' }}
              animate={heroInView ? { y: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              className="font-display text-[clamp(52px,10vw,140px)] font-light leading-[0.9] tracking-tight text-[#F0F0F5]"
            >
              KGN
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: '110%' }}
              animate={heroInView ? { y: 0 } : {}}
              transition={{ duration: 1.0, delay: 0.32, ease: [0.76, 0, 0.24, 1] }}
              className="font-display text-[clamp(40px,7.5vw,105px)] font-light leading-[0.9] tracking-tight text-[#8888A0] italic"
            >
              Furniture & Props
            </motion.h1>
          </div>

          <motion.div
            variants={clipReveal}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.9 }}
            className="h-px bg-[#2A2A3A] mb-6 origin-left"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              custom={12}
              className="text-[#8888A0] text-base sm:text-lg leading-relaxed max-w-sm"
            >
              Premium props for Bollywood, OTT & commercial productions.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              custom={14}
              className="shrink-0"
            >
              <a
                href="#catalogue"
                className="inline-flex items-center gap-2 font-mono text-xs text-[#F0F0F5] border border-[#2A2A3A] hover:border-[#E94560] hover:text-[#E94560] px-5 py-3 rounded-full transition-all"
              >
                Browse Catalogue
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[#333348]">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-y border-[#1A1A2A] bg-[#0D0D14]"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 grid grid-cols-3 divide-x divide-[#1A1A2A]">
          {[
            { value: String(totalItems), label: 'Props' },
            { value: String(categories.length), label: 'Categories' },
            { value: '30+', label: 'Years Experience' },
          ].map(({ value, label }) => (
            <div key={label} className="px-4 sm:px-8 text-center first:pl-0 last:pr-0">
              <div className="font-display text-2xl sm:text-3xl font-medium text-[#F0F0F5]">{value}</div>
              <div className="font-mono text-[10px] text-[#555568] uppercase tracking-[0.2em] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── Search ──────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 py-10 max-w-3xl mx-auto">
        <SearchBar />
      </section>

      {/* ─── Category Grid ───────────────────────────────────────── */}
      <section id="catalogue" className="px-6 sm:px-10 pb-24 max-w-7xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="font-mono text-[10px] text-[#E94560] uppercase tracking-[0.25em] mb-2">Collections</p>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#F0F0F5] italic">Browse by Category</h2>
          </div>
          <span className="font-mono text-xs text-[#555568] hidden sm:block">{categories.length} categories</span>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={i}
            >
              <Link href={`/${cat.slug}`} className="group block relative aspect-[3/4] overflow-hidden rounded-lg bg-[#111118]">
                {/* Image */}
                {cat.thumbnail ? (
                  <Image
                    src={cat.thumbnail}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-[#111118]" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  {/* Count badge */}
                  <div className="self-end">
                    <span className="font-mono text-[10px] text-[#8888A0] bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                      {cat.item_count ?? 0}
                    </span>
                  </div>

                  {/* Category name */}
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-light text-[#F0F0F5] leading-tight mb-1">
                      {cat.name}
                    </h3>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '2rem' }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 + 0.4, duration: 0.5 }}
                      className="h-px bg-[#E94560]"
                    />
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 border border-transparent group-hover:border-[#E94560]/40 rounded-lg transition-colors duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Contact Strip ───────────────────────────────────────── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-t border-[#1A1A2A] bg-[#0D0D14]"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <h3 className="font-display text-3xl sm:text-4xl font-light italic text-[#F0F0F5] mb-2">
                Need something specific?
              </h3>
              <p className="text-[#8888A0] text-sm">Talk to us directly — we can source or customise.</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '91XXXXXXXXXX'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd5b] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                WhatsApp Us
              </a>
              <Link href="/admin" className="font-mono text-[10px] text-[#2A2A3A] hover:text-[#555568] transition-colors">
                admin
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1A1A2A] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-xs font-mono text-[#555568]">
            <span>Mumbai, Maharashtra</span>
            <span className="hidden sm:block text-[#1A1A2A]">·</span>
            <span>Film, OTT & Commercial Productions</span>
            <span className="hidden sm:block text-[#1A1A2A]">·</span>
            <span>© {new Date().getFullYear()} KGN Furniture and Props</span>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
