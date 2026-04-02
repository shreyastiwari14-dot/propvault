"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePropList, type PropListItem } from "@/components/PropListContext";

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

/* ── Animation Presets ── */
const EASE = [0.22, 1, 0.36, 1] as const;

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

  const filteredItems =
    filter === "available"
      ? items.filter(
          (item) => item.status === "available" && item.quantity_available > 0
        )
      : items;

  return (
    <main className="min-h-screen pt-20">
      {/* ── Header ── */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-28 pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-6 text-[11px] font-mono text-[#4e4e66]"
          >
            <Link href="/" className="hover:text-[#8a8a9e] transition-colors">
              Home
            </Link>
            <span className="text-[#2a2a3a]">/</span>
            <span className="text-[#8a8a9e]">{category.name}</span>
          </motion.nav>

          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight"
              >
                {category.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-mono text-sm text-[#8a8a9e] mt-2"
              >
                {filteredItems.length} pieces
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
                  className={`px-4 py-2.5 font-mono text-xs tracking-wide rounded-xl border transition-all duration-300 ${
                    filter === f
                      ? "border-[#00d4b1] text-[#00d4b1] bg-[rgba(0,212,177,0.06)]"
                      : "border-[rgba(255,255,255,0.06)] text-[#8a8a9e] hover:border-[rgba(255,255,255,0.12)] hover:text-[#f0f0f3]"
                  }`}
                >
                  {f === "all" ? "All Items" : "Available"}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Item Grid ── */}
      <div
        ref={gridRef}
        className="px-6 md:px-12 lg:px-20 xl:px-28 pb-24 md:pb-28"
      >
        <div className="max-w-[1400px] mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#4e4e66] font-mono text-sm">
                No items match your filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
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
      </div>
    </main>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ITEM CARD with Add-to-List
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
      className={`group relative block rounded-2xl overflow-hidden bg-[#0a0a12] border transition-all duration-500 ${
        isInList
          ? "border-[#00d4b1] shadow-[0_0_24px_rgba(0,212,177,0.08)]"
          : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,212,177,0.2)]"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-[#08080e] overflow-hidden">
        {item.thumbnail && !imgError ? (
          <Image
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-600 ease-out group-hover:scale-106"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm text-[#1e1e30]">
              {item.item_code}
            </span>
          </div>
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide backdrop-blur-sm ${
              isAvailable
                ? "bg-[rgba(0,212,177,0.15)] text-[#00d4b1]"
                : "bg-[rgba(255,80,80,0.15)] text-[#ff5050]"
            }`}
          >
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        {/* Add to List button */}
        <button
          onClick={handleToggle}
          className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${
            isInList
              ? "bg-[#00d4b1] text-[#05050a] scale-100"
              : "bg-[rgba(0,0,0,0.5)] text-white opacity-0 group-hover:opacity-100 hover:bg-[#00d4b1] hover:text-[#05050a]"
          }`}
          aria-label={isInList ? "Remove from list" : "Add to list"}
        >
          {isInList ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-sm text-[#f0f0f3] truncate group-hover:text-[#00d4b1] transition-colors duration-300">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[11px] text-[#4e4e66]">
            {item.item_code}
          </span>
          {item.quantity_total > 1 && (
            <span className="font-mono text-[11px] text-[#4e4e66]">
              Qty: {item.quantity_available}/{item.quantity_total}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
