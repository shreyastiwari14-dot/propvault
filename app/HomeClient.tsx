"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { EASE, fadeUp, clipReveal, lineReveal, staggerContainer, staggerChild } from "@/lib/animations";

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

/* ── Animated Counter ── */
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums text-[#c4a776]">
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
   HERO — Cinematic Editorial Split
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

  const heroImages = categories
    .filter((c) => c.thumbnail)
    .slice(0, 4)
    .map((c) => c.thumbnail!);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden"
    >
      {/* ── Background ── */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: bgY }}>
        <Image
          src="https://oymcvzzfgmhaafnmizks.supabase.co/storage/v1/object/public/prop-images/hero/IMG_2802.jpeg"
          alt="KGN Props showroom"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#030305]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent" />

        {/* Brass ambient glow */}
        <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_top_right,rgba(196,167,118,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(122,158,142,0.03),transparent_60%)]" />

        {/* Parallax image stack — desktop */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 hidden lg:block">
            {heroImages.slice(0, 3).map((img, i) => {
              const positions = [
                "top-[12%] right-[4%] w-[260px] h-[340px]",
                "top-[38%] right-[22%] w-[200px] h-[260px]",
                "bottom-[12%] right-[8%] w-[220px] h-[280px]",
              ];
              const opacities = [0.14, 0.09, 0.11];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: opacities[i], y: 0 }}
                  transition={{ delay: 1 + i * 0.3, duration: 1.2, ease: EASE }}
                  className={`absolute ${positions[i]} rounded-2xl overflow-hidden border border-[rgba(196,167,118,0.08)]`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 container-editorial"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-3xl">
          {/* Brass mono label */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
            className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#c4a776] mb-8"
          >
            Est. 1994 &mdash; Mumbai
          </motion.p>

          {/* Headline — editorial serif with clip-path reveals */}
          <div className="overflow-hidden mb-2">
            <motion.div
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.4 }}
            >
              <h1 className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.02em] text-[#eae8e4]">
                Where Every Prop
              </h1>
            </motion.div>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.div
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, ease: EASE, delay: 0.55 }}
            >
              <h1 className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.02em] text-gradient-brass">
                Tells a Story
              </h1>
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="text-[#8a877f] text-base md:text-lg max-w-xl leading-relaxed mb-10"
          >
            {totalItems}+ curated furniture and props for film, television and
            advertising productions. Inspect in our Oshiwara showroom before you book.
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
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-[#c4a776] text-[#030305] font-display text-sm tracking-wide rounded-full hover:bg-[#d4ba8a] hover:shadow-[0_0_40px_rgba(196,167,118,0.2)] transition-all duration-400"
            >
              Explore Collection
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
              className="inline-flex items-center gap-2.5 px-8 py-4 border border-[rgba(255,255,255,0.08)] text-[#eae8e4] font-display text-sm tracking-wide rounded-full hover:border-[rgba(196,167,118,0.3)] hover:text-[#c4a776] transition-all duration-400"
            >
              Visit Showroom
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
        <span className="text-[#4a4840] text-[10px] font-mono tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-[#4a4840]/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#c4a776] animate-scroll-line" />
        </div>
      </motion.div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MARQUEE BAND — Dual row, editorial
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MarqueeBand() {
  const row1 = [
    "Period Furniture",
    "Contemporary Pieces",
    "Art Deco",
    "Rustic Farmhouse",
    "542+ Items In Stock",
    "Bollywood",
  ];
  const row2 = [
    "OTT Production",
    "Commercial Shoots",
    "Handpicked For Set",
    "Mumbai Showroom",
    "25 Years Of Set Craft",
    "Inspection Before Booking",
  ];

  return (
    <div className="relative py-6 overflow-hidden bg-[#09090f]/50 border-y border-[rgba(255,255,255,0.04)]">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030305] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030305] to-transparent z-10" />

      {/* Row 1 — forward */}
      <div className="animate-marquee flex whitespace-nowrap mb-3">
        {[...row1, ...row1, ...row1].map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 mx-6 text-xs font-mono tracking-[0.2em] uppercase text-[#4a4840]"
          >
            {text}
            <span className="w-1 h-1 rounded-full bg-[#c4a776] opacity-40" />
          </span>
        ))}
      </div>

      {/* Row 2 — reverse */}
      <div className="animate-marquee-reverse flex whitespace-nowrap">
        {[...row2, ...row2, ...row2].map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 mx-6 text-xs font-mono tracking-[0.2em] uppercase text-[#4a4840]/60"
          >
            {text}
            <span className="w-0.5 h-0.5 rounded-full bg-[#7a9e8e] opacity-30" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CATEGORIES — Editorial Bento Grid
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CategoriesSection({ categories }: { categories: CategoryData[] }) {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="catalog" className="py-24 md:py-36">
      <div className="container-editorial">
        {/* Header */}
        <div ref={headerRef} className="mb-12 md:mb-16">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
            className="section-label mb-4"
          >
            002 / Collection
          </motion.p>
          <div className="flex items-end justify-between">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#eae8e4]"
            >
              The Collection
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={headerInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="hidden md:block font-mono text-xs text-[#4a4840] tracking-wider"
            >
              {categories.length} collections
            </motion.p>
          </div>
          <motion.div
            variants={lineReveal}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            className="line-brass mt-6"
          />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: Math.min(i, 10) * 0.04,
              }}
              className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
            >
              <CategoryCard category={cat} featured={i === 0} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  featured = false,
}: {
  category: CategoryData;
  featured?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/${category.slug}`}
      className="group block relative rounded-2xl overflow-hidden bg-[#09090f] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(196,167,118,0.2)] transition-all duration-500"
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[4/5] md:aspect-square" : "aspect-[3/4]"}`}>
        {category.thumbnail && !imgError ? (
          <Image
            src={category.thumbnail}
            alt={category.name}
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 50vw, 25vw"
            }
            className="object-cover transition-all duration-700 ease-out group-hover:scale-106"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#09090f]">
            <span className="font-display text-5xl text-[#111119]">
              {category.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030305]/90 via-[#030305]/30 to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#c4a776]/0 group-hover:bg-[#c4a776]/[0.06] transition-colors duration-500" />

        {/* "View Collection" on hover */}
        <div className="absolute inset-0 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <span className="px-5 py-2 rounded-full border border-[rgba(234,232,228,0.2)] text-[#eae8e4] text-xs font-mono tracking-[0.15em] uppercase backdrop-blur-sm bg-[#030305]/30">
            View Collection
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className={`font-display text-[#eae8e4] group-hover:text-[#c4a776] transition-colors duration-300 ${featured ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}>
            {category.name}
          </h3>
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#c4a776]/70 mt-1 block">
            {category.item_count} {category.item_count === 1 ? "piece" : "pieces"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATS — Editorial inline prose
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

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#09090f]/50 border-y border-[rgba(255,255,255,0.04)]">
      <div className="container-editorial">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="section-label mb-10 md:mb-14"
        >
          003 / Heritage
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.15] text-[#eae8e4] max-w-5xl"
        >
          Over{" "}
          {inView ? <Counter target={totalItems} suffix="+" /> : <span className="text-[#c4a776]">0+</span>}{" "}
          curated props across{" "}
          {inView ? <Counter target={categoryCount} /> : <span className="text-[#c4a776]">0</span>}{" "}
          collections, serving{" "}
          {inView ? <Counter target={1000} suffix="+" /> : <span className="text-[#c4a776]">0+</span>}{" "}
          productions in{" "}
          {inView ? <Counter target={25} suffix="+" /> : <span className="text-[#c4a776]">0+</span>}{" "}
          years of Indian cinema.
        </motion.p>

        <motion.div
          variants={lineReveal}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="line-brass mt-14"
        />
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ABOUT — Editorial three-column
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const points = [
    "500+ Film & TV Productions",
    "Delivery Across Maharashtra",
    "Same-Day Availability",
    "WhatsApp-First Communication",
  ];

  return (
    <section id="about" ref={ref} className="py-24 md:py-36">
      <div className="container-editorial">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="section-label mb-12 md:mb-16"
        >
          004 / About
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-[#eae8e4] mb-6 leading-[1.1]">
              Mumbai&apos;s most trusted
              <br />
              prop house since{" "}
              <span className="text-[#c4a776]">1994</span>
            </h2>
            <p className="text-[#8a877f] leading-relaxed text-base md:text-lg max-w-lg">
              From Bollywood blockbusters to international ad campaigns, KGN
              Ceramica Furniture has dressed sets that audiences remember. Our
              showroom in Oshiwara houses hundreds of curated furniture pieces
              spanning every era and style — ready to inspect, book, and deliver
              to your set.
            </p>
          </motion.div>

          {/* Right — trust points */}
          <div className="space-y-3">
            {points.map((pt, i) => (
              <motion.div
                key={pt}
                initial={{ opacity: 0, x: 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.2 + i * 0.1,
                }}
                className="flex items-center gap-4 p-5 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[#09090f]/40 hover:border-[rgba(196,167,118,0.15)] hover:bg-[#0d0b09]/60 transition-all duration-400 group"
              >
                <span className="w-8 h-8 rounded-full bg-[rgba(196,167,118,0.08)] flex items-center justify-center flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c4a776] group-hover:scale-150 transition-transform" />
                </span>
                <span className="font-display text-sm md:text-base text-[#eae8e4]">
                  {pt}
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
      className="py-28 md:py-40 bg-[#0d0b09] border-t border-[rgba(255,255,255,0.04)]"
    >
      <div className="container-editorial text-center">
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
          className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#eae8e4] mb-6"
        >
          Ready to Dress Your Set?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="text-[#8a877f] text-base md:text-lg max-w-lg mx-auto mb-12"
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
            className="inline-flex items-center gap-2.5 px-9 py-4.5 bg-[#c4a776] text-[#030305] font-display text-sm rounded-full hover:bg-[#d4ba8a] hover:shadow-[0_0_40px_rgba(196,167,118,0.2)] transition-all duration-400"
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
            Start a Conversation
          </a>
          <a
            href="tel:+919999999999"
            className="inline-flex items-center gap-2.5 px-9 py-4.5 border border-[rgba(255,255,255,0.08)] text-[#eae8e4] font-display text-sm rounded-full hover:border-[rgba(196,167,118,0.3)] hover:text-[#c4a776] transition-all duration-400"
          >
            Call Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOOTER — Editorial minimal
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.04)]">
      {/* Brass gradient line */}
      <div className="line-brass" />

      <div className="container-editorial py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10 md:gap-20 items-start">
          {/* Logo */}
          <div>
            <p className="font-display text-3xl text-[#eae8e4] mb-3">
              KGN<span className="text-[#c4a776]">.</span>
            </p>
            <p className="text-[#4a4840] text-xs leading-relaxed max-w-xs">
              Premium furniture and props for film, television, and advertising
              productions in Mumbai.
            </p>
          </div>

          {/* Nav */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a776] mb-4">
              Navigate
            </p>
            <Link href="/#catalog" className="block text-sm text-[#8a877f] hover:text-[#eae8e4] transition-colors">
              Catalog
            </Link>
            <Link href="/#about" className="block text-sm text-[#8a877f] hover:text-[#eae8e4] transition-colors">
              About
            </Link>
            <Link href="/book" className="block text-sm text-[#8a877f] hover:text-[#eae8e4] transition-colors">
              Book Props
            </Link>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4a776] mb-4">
              Contact
            </p>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#8a877f] hover:text-[#eae8e4] transition-colors">
              WhatsApp
            </a>
            <p className="text-sm text-[#8a877f]">Oshiwara, Mumbai</p>
            <p className="text-sm text-[#8a877f]">Mon — Sat, 10am — 6pm</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#4a4840] text-[11px] font-mono tracking-wider">
            &copy; {new Date().getFullYear()} KGN Ceramica Furniture
          </p>
          <p className="text-[#4a4840] text-[11px] font-mono tracking-wider">
            Built for the Indian Film Industry
          </p>
        </div>
      </div>
    </footer>
  );
}
