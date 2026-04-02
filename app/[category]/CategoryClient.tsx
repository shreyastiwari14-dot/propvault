"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

/* ── Animation ── */
const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.04 },
  }),
};

export default function CategoryClient({ category, items }: CategoryClientProps) {
  const [filter, setFilter] = useState<"all" | "available">("all");
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: "-40px" });

  const filteredItems =
    filter === "available"
      ? items.filter((item) => item.status === "available" && item.quantity_available > 0)
      : items;

  return (
    <main className="min-h-screen pt-20">
      {/* ── Header ── */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-28 pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-xs font-mono text-[#55556a]">
            <Link href="/" className="hover:text-[#8b8ba0] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8b8ba0]">{category.name}</span>
          </nav>

          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight"
              >
                {category.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-mono text-sm text-[#8b8ba0] mt-2"
              >
                {category.item_count} pieces available
              </motion.p>
            </div>

            {/* Filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              {(["all", "available"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 font-mono text-xs tracking-wide rounded-lg border transition-all duration-300 ${
                    filter === f
                      ? "border-[#00d4b1] text-[#00d4b1] bg-[rgba(0,212,177,0.08)]"
                      : "border-[rgba(255,255,255,0.07)] text-[#8b8ba0] hover:border-[rgba(255,255,255,0.14)]"
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
        className="px-6 md:px-12 lg:px-20 xl:px-28 pb-20 md:pb-28"
      >
        <div className="max-w-[1400px] mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#55556a] font-mono text-sm">
                No items match your filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate={gridInView ? "visible" : "hidden"}
                  custom={Math.min(i, 15)} // Cap delay so late items don't wait forever
                >
                  <ItemCard item={item} categorySlug={category.slug} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/* ── Item Card ── */
function ItemCard({ item, categorySlug }: { item: ItemData; categorySlug: string }) {
  const [imgError, setImgError] = useState(false);
  const isAvailable = item.status === "available" && item.quantity_available > 0;

  return (
    <Link
      href={`/${categorySlug}/${item.item_code}`}
      className="group block rounded-xl overflow-hidden bg-[#0c0c12] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(0,212,177,0.25)] transition-all duration-400"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-[#0a0a10] overflow-hidden">
        {item.thumbnail && !imgError ? (
          <Image
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm text-[#2a2a3a]">{item.item_code}</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wide ${
              isAvailable
                ? "bg-[rgba(0,212,177,0.15)] text-[#00d4b1]"
                : "bg-[rgba(255,80,80,0.15)] text-[#ff5050]"
            }`}
          >
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-medium text-sm text-[#ededf0] truncate group-hover:text-[#00d4b1] transition-colors duration-300">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono text-[11px] text-[#55556a]">
            {item.item_code}
          </span>
          {item.quantity_total > 1 && (
            <span className="font-mono text-[11px] text-[#55556a]">
              Qty: {item.quantity_available}/{item.quantity_total}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
