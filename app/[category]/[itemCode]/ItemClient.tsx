"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ── Types ── */
interface ItemImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ItemDetail {
  id: string;
  item_code: string;
  name: string;
  description: string | null;
  material: string | null;
  color: string | null;
  style: string | null;
  height: string | null;
  length: string | null;
  width: string | null;
  depth: string | null;
  configuration: string | null;
  quantity_available: number;
  quantity_total: number;
  status: string;
}

interface ItemClientProps {
  item: ItemDetail;
  images: ItemImage[];
  category: { name: string; slug: string };
}

/* ── WhatsApp ── */
const WA_NUMBER = "919999999999";
const waLink = (code: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Hi, I'm interested in prop ${code} from your catalog. Is it available?`
  )}`;

/* ── Animation ── */
const EASE = [0.22, 1, 0.36, 1] as const;

export default function ItemClient({
  item,
  images,
  category,
}: ItemClientProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const isAvailable =
    item.status === "available" && item.quantity_available > 0;
  const primaryImg = images[activeImg]?.url || images[0]?.url || null;

  // Build specs table
  const specs: [string, string][] = [];
  if (item.material) specs.push(["Material", item.material]);
  if (item.color) specs.push(["Color", item.color]);
  if (item.style) specs.push(["Style", item.style]);
  if (item.configuration) specs.push(["Configuration", item.configuration]);
  if (item.height) specs.push(["Height", item.height]);
  if (item.length) specs.push(["Length", item.length]);
  if (item.width) specs.push(["Width", item.width]);
  if (item.depth) specs.push(["Depth", item.depth]);
  specs.push([
    "Quantity",
    `${item.quantity_available} of ${item.quantity_total} available`,
  ]);

  return (
    <>
      <main className="min-h-screen pt-20">
        <div className="px-6 md:px-12 lg:px-20 xl:px-28 py-8 md:py-12">
          <div className="max-w-[1400px] mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-8 text-[11px] font-mono text-[#4e4e66]">
              <Link
                href="/"
                className="hover:text-[#8a8a9e] transition-colors"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                href={`/${category.slug}`}
                className="hover:text-[#8a8a9e] transition-colors"
              >
                {category.name}
              </Link>
              <span>/</span>
              <span className="text-[#8a8a9e]">{item.item_code}</span>
            </nav>

            {/* ── Split Layout ── */}
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 lg:gap-16">
              {/* LEFT — Images */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {/* Main Image */}
                <div
                  className="relative aspect-[4/5] bg-[#0a0a12] rounded-2xl overflow-hidden cursor-zoom-in border border-[rgba(255,255,255,0.06)]"
                  onClick={() => setLightbox(true)}
                >
                  {primaryImg ? (
                    <Image
                      src={primaryImg}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-lg text-[#1e1e30]">
                        {item.item_code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImg(i)}
                        className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImg === i
                            ? "border-[#00d4b1]"
                            : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={`${item.name} view ${i + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* RIGHT — Details */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                className="flex flex-col"
              >
                {/* Status */}
                <span
                  className={`inline-block w-fit px-3 py-1.5 rounded-full text-xs font-mono tracking-wide mb-4 ${
                    isAvailable
                      ? "bg-[rgba(0,212,177,0.1)] text-[#00d4b1]"
                      : "bg-[rgba(255,80,80,0.1)] text-[#ff5050]"
                  }`}
                >
                  {isAvailable ? "Available for Booking" : "Currently Booked"}
                </span>

                {/* Name */}
                <h1 className="font-display font-extrabold text-2xl md:text-3xl lg:text-4xl tracking-tight mb-2">
                  {item.name}
                </h1>

                {/* Code */}
                <p className="font-mono text-sm text-[#00d4b1] mb-6">
                  {item.item_code}
                </p>

                {/* Description */}
                {item.description && (
                  <p className="text-[#8a8a9e] leading-relaxed mb-8">
                    {item.description}
                  </p>
                )}

                {/* Specs Table */}
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 mb-8">
                  <h3 className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#4e4e66] mb-4">
                    Specifications
                  </h3>
                  <div className="space-y-3">
                    {specs.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between items-baseline py-2 border-b border-[rgba(255,255,255,0.04)]"
                      >
                        <span className="text-sm text-[#8a8a9e]">{label}</span>
                        <span className="text-sm text-[#f0f0f3] font-medium text-right ml-4">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-auto">
                  <a
                    href={waLink(item.item_code)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#00d4b1] text-[#05050a] font-display font-bold text-sm rounded-xl hover:bg-[#00f0cc] hover:shadow-[0_0_30px_rgba(0,212,177,0.15)] transition-all duration-400"
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
                    Book This Prop
                  </a>

                  <Link
                    href={`/${category.slug}`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border border-[rgba(255,255,255,0.1)] text-[#8a8a9e] font-display text-sm rounded-xl hover:border-[rgba(255,255,255,0.2)] hover:text-[#f0f0f3] transition-all duration-400"
                  >
                    ← Back to {category.name}
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && primaryImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#05050a]/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute top-6 right-6 text-[#8a8a9e] hover:text-white transition-colors font-mono text-sm"
              onClick={() => setLightbox(false)}
            >
              ✕ Close
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-4xl aspect-[4/5] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={primaryImg}
                alt={item.name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Sticky Book Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#05050a]/90 backdrop-blur-xl border-t border-[rgba(255,255,255,0.06)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm text-[#f0f0f3] truncate">
              {item.name}
            </p>
            <p className="font-mono text-[11px] text-[#4e4e66]">
              {item.item_code}
            </p>
          </div>
          <a
            href={waLink(item.item_code)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-6 py-3 bg-[#00d4b1] text-[#05050a] font-display font-bold text-sm rounded-xl"
          >
            Book Now
          </a>
        </div>
      </div>
    </>
  );
}
