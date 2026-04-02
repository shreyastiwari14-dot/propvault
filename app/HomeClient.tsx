"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: i * 0.1 },
  }),
};

/* ── Animated Counter (GSAP-powered) ── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease out
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
export default function HomeClient({
  categoryData,
  totalItems,
}: HomeClientProps) {
  return (
    <main className="min-h-screen">
      <HeroSection categories={categoryData} totalItems={totalItems} />
      <MarqueeBand />
      <CategoriesSection categories={categoryData} />
      <StatsSection
        totalItems={totalItems}
        categoryCount={categoryData.length}
      />
      <AboutSection />
      <CTASection />
      <Footer />
    </main>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO — Image mosaic bg + word reveal
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HeroSection({
  categories,
  totalItems,
}: {
  categories: CategoryData[];
  totalItems: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  // Pick best thumbnails for the bg mosaic (first 6 that have images)
  const heroImages = categories
    .filter((c) => c.thumbnail)
    .slice(0, 6)
    .map((c) => c.thumbnail!);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
    >
      {/* ── Background ── */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: bgY }}>
        {/* Full-screen hero photo */}
        <Image
          src="https://oymcvzzfgmhaafnmizks.supabase.co/storage/v1/object/public/prop-images/hero/IMG_2802.jpeg"
          alt="KGN Props — vintage Indian set"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#05050a]/72" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent" />

        {/* Image grid behind text - visible on desktop */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 hidden lg:block">
            <div className="absolute top-[10%] right-[5%] w-[280px] h-[360px] rounded-2xl overflow-hidden opacity-[0.12]">
              <Image
                src={heroImages[0]}
                alt=""
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
            {heroImages[1] && (
              <div className="absolute top-[35%] right-[25%] w-[200px] h-[260px] rounded-2xl overflow-hidden opacity-[0.08]">
                <Image
                  src={heroImages[1]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            )}
            {heroImages[2] && (
              <div className="absolute bottom-[15%] right-[8%] w-[240px] h-[300px] rounded-2xl overflow-hidden opacity-[0.1]">
                <Image
                  src={heroImages[2]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              </div>
            )}
          </div>
        )}

        {/* Ambient glow effects */}
        <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,177,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(240,104,48,0.03),transparent_60%)]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Giant faded item count */}
        <div className="absolute bottom-[10%] right-[5%] font-display font-extrabold text-[15vw] lg:text-[20vw] text-white/[0.02] leading-none select-none pointer-events-none">
          {totalItems}
        </div>
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 px-6 md:px-12 lg:px-20 xl:px-28"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Section number */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#4e4e66] mb-8"
          >
            001 / Home
          </motion.p>

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

          {/* Headline — word-by-word stagger reveal */}
          <div className="overflow-hidden mb-2">
            <motion.div
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            >
              <h1 className="font-display font-extrabold text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.03em]">
                Props That Make
              </h1>
            </motion.div>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.div
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.35 }}
            >
              <h1 className="font-display font-extrabold text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.03em] text-[#00d4b1]">
                Scenes Iconic
              </h1>
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="text-[#8a8a9e] text-base md:text-lg max-w-xl leading-relaxed mb-10"
          >
            {totalItems}+ curated furniture pieces for film, television and
            advertising productions. Inspect before you book.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="#catalog"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-[#00d4b1] text-[#05050a] font-display font-bold text-sm tracking-wide rounded-xl hover:bg-[#00f0cc] hover:shadow-[0_0_40px_rgba(0,212,177,0.2)] transition-all duration-400"
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
              className="inline-flex items-center gap-2.5 px-8 py-4 border border-[rgba(255,255,255,0.1)] text-[#f0f0f3] font-display font-medium text-sm tracking-wide rounded-xl hover:border-[#00d4b1] hover:text-[#00d4b1] transition-all duration-400"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp Us
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[#4e4e66] text-[10px] font-mono tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-[#4e4e66]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#00d4b1] animate-scroll-line" />
        </div>
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
    <div className="relative border-y border-[rgba(255,255,255,0.06)] py-4 overflow-hidden bg-[#0a0a12]/50">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 mx-5 text-[11px] font-mono tracking-[0.15em] uppercase text-[#4e4e66]"
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
   CATEGORIES — Horizontal Scroll (GSAP Pinned)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CategoriesSection({ categories }: { categories: CategoryData[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  useLayoutEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;
    if (typeof window === "undefined") return;

    // Only do horizontal scroll on desktop (>= 1024px)
    if (window.innerWidth < 1024) return;

    const track = trackRef.current;
    const cards = track.querySelectorAll(".category-card");
    if (cards.length === 0) return;

    // Calculate how far we need to scroll horizontally
    const totalScrollWidth = track.scrollWidth - window.innerWidth + 200;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${totalScrollWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(track, {
      x: -totalScrollWidth,
      ease: "none",
    });

    // Staggered card reveal
    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: tl,
            start: "left 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [categories]);

  return (
    <section id="catalog" ref={sectionRef} className="relative">
      {/* Fixed header area */}
      <div
        ref={headerRef}
        className="px-6 md:px-12 lg:px-20 xl:px-28 pt-20 md:pt-28 pb-10"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={headerInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, ease: EASE }}
                className="section-label mb-3"
              >
                002 / Collection
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight"
              >
                Categories
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="hidden md:block font-mono text-sm text-[#4e4e66]"
            >
              {categories.length} collections — scroll →
            </motion.p>
          </div>
        </div>
      </div>

      {/* Horizontal scroll track (desktop) / Normal grid (mobile) */}
      {/* Desktop: horizontal scroll */}
      <div className="hidden lg:block">
        <div
          ref={trackRef}
          className="horizontal-scroll-track pl-6 md:pl-12 lg:pl-20 xl:pl-28 pb-20"
        >
          {categories.map((cat) => (
            <div key={cat.id} className="category-card flex-shrink-0 w-[380px]">
              <CategoryCard category={cat} variant="horizontal" />
            </div>
          ))}
          {/* End spacer */}
          <div className="flex-shrink-0 w-28" />
        </div>
      </div>

      {/* Mobile: normal grid */}
      <div className="lg:hidden px-6 md:px-12 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: Math.min(i, 8) * 0.06,
              }}
            >
              <CategoryCard category={cat} variant="grid" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  variant,
}: {
  category: CategoryData;
  variant: "horizontal" | "grid";
}) {
  const [imgError, setImgError] = useState(false);

  const isHorizontal = variant === "horizontal";

  return (
    <Link
      href={`/${category.slug}`}
      className={`group block rounded-2xl overflow-hidden bg-[#0a0a12] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,212,177,0.25)] hover:shadow-[0_8px_40px_rgba(0,212,177,0.06)] transition-all duration-500 ${
        isHorizontal ? "" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          isHorizontal ? "aspect-[3/4]" : "aspect-[4/3]"
        }`}
      >
        {category.thumbnail && !imgError ? (
          <Image
            src={category.thumbnail}
            alt={category.name}
            fill
            sizes={
              isHorizontal
                ? "380px"
                : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            }
            className="object-cover transition-all duration-700 ease-out group-hover:scale-108"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12]">
            <span className="font-display text-4xl font-extrabold text-[#111120]">
              {category.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/80 via-[#05050a]/20 to-transparent" />

        {/* "View" label on hover (desktop) */}
        <div className="absolute inset-0 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="px-5 py-2 rounded-full border border-white/20 text-white text-xs font-mono tracking-[0.15em] uppercase backdrop-blur-sm bg-white/5">
            View
          </span>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between">
        <h3 className="font-display font-bold text-base text-[#f0f0f3] group-hover:text-[#00d4b1] transition-colors duration-300 truncate pr-3">
          {category.name}
        </h3>
        <span className="flex-shrink-0 font-mono text-xs px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[#8a8a9e] group-hover:bg-[rgba(0,212,177,0.1)] group-hover:text-[#00d4b1] transition-all duration-300">
          {category.item_count}
        </span>
      </div>
    </Link>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATS — Large counters + GSAP count-up
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
    <section
      ref={ref}
      className="border-y border-[rgba(255,255,255,0.06)] bg-[#0a0a12]/50"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="section-label mb-12 md:mb-16"
        >
          003 / Numbers
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
            >
              <p className="font-display font-extrabold text-5xl md:text-6xl lg:text-[4.5rem] text-[#f0f0f3] mb-3">
                {inView ? (
                  <Counter target={stat.value} suffix={stat.suffix} />
                ) : (
                  <span>0{stat.suffix}</span>
                )}
              </p>
              <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#4e4e66]">
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
   ABOUT — Split layout, slide from sides
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
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="section-label mb-12 md:mb-16"
        >
          004 / About
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left — slides in from left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <h2 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6 leading-[1.05]">
              Mumbai&apos;s most trusted
              <br />
              prop house since{" "}
              <span className="text-[#00d4b1]">1994</span>
            </h2>
            <p className="text-[#8a8a9e] leading-relaxed text-base md:text-lg max-w-lg">
              From Bollywood blockbusters to international ad campaigns, KGN
              Ceramica Furniture has dressed sets that audiences remember. Our
              showroom in Oshiwara houses hundreds of curated furniture pieces
              spanning every era and style — ready to inspect, book, and deliver
              to your set.
            </p>
          </motion.div>

          {/* Right — trust points slide in staggered */}
          <div className="space-y-4">
            {points.map((pt, i) => (
              <motion.div
                key={pt.text}
                initial={{ opacity: 0, x: 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.2 + i * 0.1,
                }}
                className="flex items-center gap-4 p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0a0a12]/40 hover:border-[rgba(0,212,177,0.15)] hover:bg-[#0a0a12]/70 transition-all duration-400"
              >
                <span className="text-xl flex-shrink-0">{pt.icon}</span>
                <span className="font-display font-semibold text-sm md:text-base text-[#f0f0f3]">
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
      className="px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-32 bg-[#0a0a12]/50 border-t border-[rgba(255,255,255,0.06)]"
    >
      <div className="max-w-[1400px] mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="section-label mb-6"
        >
          005 / Contact
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5"
        >
          Ready to dress your set?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="text-[#8a8a9e] text-base md:text-lg max-w-lg mx-auto mb-12"
        >
          Reach out on WhatsApp for availability, pricing, and to schedule a
          showroom visit in Oshiwara, Mumbai.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-9 py-4.5 bg-[#25D366] text-white font-display font-bold text-sm rounded-xl hover:bg-[#20bd5a] hover:shadow-[0_0_40px_rgba(37,211,102,0.2)] transition-all duration-400"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Chat on WhatsApp
          </a>
          <a
            href="tel:+919999999999"
            className="inline-flex items-center gap-2 px-9 py-4.5 border border-[rgba(255,255,255,0.1)] text-[#f0f0f3] font-display font-medium text-sm rounded-xl hover:border-[rgba(255,255,255,0.2)] hover:text-white transition-all duration-400"
          >
            📞 Call Us
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
    <footer className="px-6 md:px-12 lg:px-20 xl:px-28 py-10 border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display font-extrabold text-xl tracking-tight">
          KGN<span className="text-[#00d4b1]">.</span>
        </p>
        <p className="text-[#4e4e66] text-xs font-mono">
          © {new Date().getFullYear()} KGN Ceramica Furniture • Oshiwara, Mumbai
        </p>
        <p className="text-[#4e4e66] text-xs">
          Built for the Indian Film Industry
        </p>
      </div>
    </footer>
  );
}
