"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ── Types ── */
interface CategoryData {
  id: string;
  name: string;
  slug: string;
  item_count: number;
  thumbnail: string | null;
}

interface HomeClientProps {
  categoryData: CategoryData[];
  totalItems: number;
}

/* ── Animation Presets ── */
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: i * 0.1 },
  }),
};

const slideIn = {
  hidden: (dir: "left" | "right") => ({
    opacity: 0,
    x: dir === "left" ? -40 : 40,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

/* ── Animated Counter ── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

/* ── WhatsApp Helper ── */
const WA_NUMBER = "919999999999";
const waLink = (msg?: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    msg || "Hi, I'd like to know more about your prop collection."
  )}`;

/* ══════════════════════════════════════════
   HOMEPAGE
   ══════════════════════════════════════════ */
export default function HomeClient({ categoryData, totalItems }: HomeClientProps) {
  return (
    <main className="min-h-screen">
      <HeroSection totalItems={totalItems} />
      <MarqueeBand />
      <CategoriesSection categories={categoryData} />
      <StatsSection totalItems={totalItems} categoryCount={categoryData.length} />
      <AboutSection />
      <CTASection />
      <Footer />
    </main>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO SECTION — Cinematic, parallax bg
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HeroSection({ totalItems }: { totalItems: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Parallax: bg moves slower than content
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
    >
      {/* Animated background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#06060a] via-[#0a0a16] to-[#06060a]" />
        <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,177,0.07),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(240,104,48,0.04),transparent_60%)]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      {/* Content with scroll fade */}
      <motion.div
        className="relative z-10 px-6 md:px-12 lg:px-20 xl:px-28"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="font-mono text-xs md:text-sm tracking-[0.25em] uppercase text-[#00d4b1] mb-5 md:mb-6"
          >
            Mumbai&apos;s Premier Prop House
          </motion.p>

          {/* Headline — word by word stagger */}
          <div className="overflow-hidden mb-2">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            >
              <h1 className="font-display font-bold text-[clamp(2.8rem,7.5vw,6.5rem)] leading-[0.92] tracking-[-0.02em]">
                Props That Make
              </h1>
            </motion.div>
          </div>
          <div className="overflow-hidden mb-6">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
            >
              <h1 className="font-display font-bold text-[clamp(2.8rem,7.5vw,6.5rem)] leading-[0.92] tracking-[-0.02em] text-[#00d4b1]">
                Scenes Iconic
              </h1>
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="text-[#8b8ba0] text-base md:text-lg max-w-xl leading-relaxed mb-8 md:mb-10"
          >
            {totalItems}+ curated furniture pieces for film, television and
            advertising productions. Inspect before you book.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="#categories"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#00d4b1] text-[#06060a] font-display font-semibold text-sm tracking-wide rounded-lg hover:bg-[#00f0cc] hover:shadow-[0_0_30px_rgba(0,212,177,0.2)] transition-all duration-300"
            >
              Browse Catalog
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-[rgba(255,255,255,0.12)] text-[#ededf0] font-display font-medium text-sm tracking-wide rounded-lg hover:border-[#00d4b1] hover:text-[#00d4b1] transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp Us
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator — animated bounce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[#55556a] text-[10px] font-mono tracking-[0.3em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[#55556a] to-transparent"
        />
      </motion.div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MARQUEE BAND
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MarqueeBand() {
  const items = [
    "Period Furniture",
    "Contemporary Pieces",
    "Art Deco",
    "Rustic Farmhouse",
    "Inspection Before Booking",
    "542+ Items In Stock",
    "Handpicked For Set",
    "Bollywood",
    "OTT Production",
    "Commercial Shoots",
    "Mumbai Showroom",
    "25 Years Of Set Craft",
  ];

  return (
    <div className="relative border-y border-[rgba(255,255,255,0.07)] py-4 overflow-hidden bg-[#0c0c12]/50">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 mx-4 text-xs font-mono tracking-[0.15em] uppercase text-[#55556a]"
          >
            {text}
            <span className="w-1 h-1 rounded-full bg-[#00d4b1] opacity-40" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CATEGORIES SECTION — Staggered reveal
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CategoriesSection({ categories }: { categories: CategoryData[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="categories"
      ref={ref}
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-mono text-xs tracking-[0.2em] uppercase text-[#00d4b1] mb-3"
            >
              Browse Collection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight"
            >
              Categories
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden md:block font-mono text-sm text-[#55556a]"
          >
            {categories.length} collections
          </motion.p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: Math.min(i, 11) * 0.06,
              }}
            >
              <CategoryCard category={cat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: CategoryData }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/${category.slug}`}
      className="group block rounded-xl overflow-hidden bg-[#0c0c12] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(0,212,177,0.3)] hover:shadow-[0_0_30px_rgba(0,212,177,0.06)] transition-all duration-400"
    >
      <div className="relative aspect-[4/3] bg-[#0c0c12] overflow-hidden">
        {category.thumbnail && !imgError ? (
          <Image
            src={category.thumbnail}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0c0c12]">
            <span className="font-display text-3xl font-bold text-[#1a1a28]">
              {category.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060a]/70 via-transparent to-transparent" />
      </div>

      <div className="p-4 flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm md:text-base text-[#ededf0] group-hover:text-[#00d4b1] transition-colors duration-300 truncate pr-3">
          {category.name}
        </h3>
        <span className="flex-shrink-0 font-mono text-xs px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[#8b8ba0] group-hover:bg-[rgba(0,212,177,0.1)] group-hover:text-[#00d4b1] transition-all duration-300">
          {category.item_count}
        </span>
      </div>
    </Link>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATS SECTION — Centered grid
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function StatsSection({
  totalItems,
  categoryCount,
}: {
  totalItems: number;
  categoryCount: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const stats = [
    { value: totalItems, suffix: "+", label: "Props In Collection" },
    { value: categoryCount, suffix: "", label: "Categories" },
    { value: 25, suffix: "+", label: "Years In Film" },
    { value: 1000, suffix: "+", label: "Productions Served" },
  ];

  return (
    <section ref={ref} className="border-y border-[rgba(255,255,255,0.07)] bg-[#0c0c12]/50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display font-bold text-4xl md:text-5xl lg:text-[3.5rem] text-[#ededf0] mb-2">
                {inView ? (
                  <Counter target={stat.value} suffix={stat.suffix} />
                ) : (
                  <span>0{stat.suffix}</span>
                )}
              </p>
              <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#55556a]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ABOUT SECTION — Slide-in from sides
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const points = [
    { icon: "🎬", text: "500+ Film & TV Productions" },
    { icon: "🚚", text: "Delivery Across Maharashtra" },
    { icon: "⚡", text: "Same-Day Availability" },
    { icon: "💬", text: "WhatsApp-First Communication" },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left — slides in from left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#00d4b1] mb-4">
              About KGN Props
            </p>
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-6 leading-tight">
              Mumbai&apos;s most trusted
              <br />
              prop house since 1994
            </h2>
            <p className="text-[#8b8ba0] leading-relaxed text-base md:text-lg">
              From Bollywood blockbusters to international ad campaigns, KGN
              Ceramica Furniture has dressed sets that audiences remember. Our
              showroom in Oshiwara houses hundreds of curated furniture pieces
              spanning every era and style — ready to inspect, book, and deliver
              to your set.
            </p>
          </motion.div>

          {/* Right — trust points slide in from right, staggered */}
          <div className="space-y-4">
            {points.map((pt, i) => (
              <motion.div
                key={pt.text}
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: 0.2 + i * 0.1,
                }}
                className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0c0c12]/30 hover:border-[rgba(0,212,177,0.2)] hover:bg-[#0c0c12]/60 transition-all duration-300"
              >
                <span className="text-xl">{pt.icon}</span>
                <span className="font-display font-medium text-sm md:text-base text-[#ededf0]">
                  {pt.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CTA SECTION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 bg-[#0c0c12]/50 border-t border-[rgba(255,255,255,0.07)]"
    >
      <div className="max-w-[1400px] mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs tracking-[0.2em] uppercase text-[#00d4b1] mb-4"
        >
          Get In Touch
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4"
        >
          Ready to dress your set?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="text-[#8b8ba0] text-base md:text-lg max-w-lg mx-auto mb-10"
        >
          Reach out on WhatsApp for availability, pricing, and to schedule a
          showroom visit in Oshiwara, Mumbai.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#25D366] text-white font-display font-semibold text-sm rounded-xl hover:bg-[#20bd5a] hover:shadow-[0_0_30px_rgba(37,211,102,0.2)] transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Chat on WhatsApp
          </a>
          <a
            href="tel:+919999999999"
            className="inline-flex items-center gap-2 px-8 py-4 border border-[rgba(255,255,255,0.12)] text-[#ededf0] font-display font-medium text-sm rounded-xl hover:border-[rgba(255,255,255,0.25)] hover:text-white transition-all duration-300"
          >
            Call Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOOTER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Footer() {
  return (
    <footer className="px-6 md:px-12 lg:px-20 xl:px-28 py-10 border-t border-[rgba(255,255,255,0.07)]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display font-bold text-lg tracking-tight">
          KGN<span className="text-[#00d4b1]">.</span>
        </p>
        <p className="text-[#55556a] text-xs font-mono">
          © {new Date().getFullYear()} KGN Ceramica Furniture • Oshiwara, Mumbai
        </p>
        <p className="text-[#55556a] text-xs">Built for the Indian Film Industry</p>
      </div>
    </footer>
  );
}
