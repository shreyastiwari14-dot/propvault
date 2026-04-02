"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePropList, type PropListItem } from "@/components/PropListContext";
import { EASE, lineReveal } from "@/lib/animations";

/* ── Types ── */
interface ItemData {
  id: string;
  item_code: string;
  name: string;
  material: string | null;
  color: string | null;
  quantity_available: number;
  quantity_total: number;
  status: string;
  thumbnail: string | null;
}

interface CategoryClientProps {
  category: {
    name: string;
    slug: string;
    item_count: number;
  };
  items: ItemData[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASE,
      delay: Math.min(i, 12) * 0.04,
    },
  }),
};

export default function CategoryClient({
  category,
  items,
}: CategoryClientProps) {
  const [filter, setFilter] = useState<"all" | "available">("all");
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-40px" });
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-40px" });

  const filteredItems =
    filter === "available"
      ? items.filter(
          (item) => item.status === "available" && item.quantity_available > 0
        )
      : items;

  return (
    <main className="min-h-screen pt-20">
      {/* ── Header ── */}
      <div ref={headerRef} className="container-editorial pt-8 pb-6 md:pt-12 md:pb-10">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-8 text-[11px] font-mono tracking-wider text-[#4a4840]"
        >
          <Link href="/" className="hover:text-[#8a877f] transition-colors">
            Home
          </Link>
          <span className="text-[#c4a776]">/</span>
          <span className="text-[#8a877f]">{category.name}</span>
        </motion.nav>

        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#eae8e4]"
            >
              {category.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-mono text-xs tracking-wider text-[#c4a776] mt-3"
            >
              {filteredItems.length} {filteredItems.length === 1 ? "piece" : "pieces"}
              {filter === "available" ? " available" : " in collection"}
            </motion.p>
          </div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-2"
          >
            {(["all", "available"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 font-mono text-[11px] tracking-wider uppercase rounded-full border transition-all duration-300 ${
                  filter === f
                    ? "border-[#c4a776] text-[#c4a776] bg-[rgba(196,167,118,0.06)]"
                    : "border-[rgba(255,255,255,0.06)] text-[#8a877f] hover:border-[rgba(255,255,255,0.12)] hover:text-[#eae8e4]"
                }`}
              >
                {f === "all" ? "All Items" : "Available"}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={lineReveal}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          className="line-brass mt-8"
        />
      </div>

      {/* ── Item Grid ── */}
      <div ref={gridRef} className="container-editorial pb-24 md:pb-32">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-[#8a877f] mb-2">
              No items match your filter
            </p>
            <p className="text-[#4a4840] text-sm">
              Try selecting &ldquo;All Items&rdquo; to see the full collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                animate={gridInView ? "visible" : "hidden"}
                custom={i}
              >
                <ItemCard
                  item={item}
                  categorySlug={category.slug}
                  categoryName={category.name}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ITEM CARD — Luxury editorial style
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ItemCard({
  item,
  categorySlug,
  categoryName,
}: {
  item: ItemData;
  categorySlug: string;
  categoryName: string;
}) {
  const [imgError, setImgError] = useState(false);
  const { toggle, has } = usePropList();
  const isAvailable =
    item.status === "available" && item.quantity_available > 0;
  const isInList = has(item.item_code);

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggle({
        id: item.id,
        item_code: item.item_code,
        name: item.name,
        category: categoryName,
        thumbnail: item.thumbnail,
      });
    },
    [toggle, item, categoryName]
  );

  return (
    <Link
      href={`/${categorySlug}/${item.item_code}`}
      className={`group relative block rounded-2xl overflow-hidden bg-[#09090f] border transition-all duration-500 ${
        isInList
          ? "border-[#c4a776] shadow-[0_0_24px_rgba(196,167,118,0.08)]"
          : "border-[rgba(255,255,255,0.04)] hover:border-[rgba(196,167,118,0.15)]"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-[#06060a] overflow-hidden">
        {item.thumbnail && !imgError ? (
          <Image
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-700 ease-out group-hover:scale-106"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm text-[#111119]">
              {item.item_code}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#c4a776]/0 group-hover:bg-[#c4a776]/[0.04] transition-colors duration-500" />

        {/* Status badge — glass */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide backdrop-blur-md ${
              isAvailable
                ? "bg-[rgba(122,158,142,0.15)] text-[#7a9e8e] border border-[rgba(122,158,142,0.2)]"
                : "bg-[rgba(196,90,60,0.15)] text-[#c45a3c] border border-[rgba(196,90,60,0.2)]"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-[#7a9e8e]" : "bg-[#c45a3c]"}`} />
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        {/* Bookmark/Add button — top right */}
        <button
          onClick={handleToggle}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isInList
              ? "bg-[#c4a776] text-[#030305] scale-100"
              : "bg-[rgba(0,0,0,0.4)] text-white/80 opacity-0 group-hover:opacity-100 hover:bg-[#c4a776] hover:text-[#030305]"
          }`}
          aria-label={isInList ? "Remove from list" : "Add to list"}
        >
          {isInList ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-sm text-[#eae8e4] truncate group-hover:text-[#c4a776] transition-colors duration-300">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[10px] tracking-wider text-[#c4a776]/60">
            {item.item_code}
          </span>
          {item.quantity_total > 1 && (
            <span className="font-mono text-[10px] text-[#4a4840]">
              {item.quantity_available}/{item.quantity_total}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
