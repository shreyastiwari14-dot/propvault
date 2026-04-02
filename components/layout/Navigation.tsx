"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/animations";

const WA_NUMBER = "919999999999";
const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to know more about your prop collection."
)}`;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);

      if (window.innerWidth < 768) {
        if (y > lastScrollY.current && y > 100) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* ── Desktop: Floating Pill Nav ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: hidden && !menuOpen ? -80 : 0,
          opacity: 1,
        }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="container-editorial flex items-center justify-between h-16 md:h-20">
          {/* Logo — always visible */}
          <Link
            href="/"
            className="font-display text-2xl text-[#eae8e4] hover:text-[#c4a776] transition-colors duration-300"
          >
            KGN<span className="text-[#c4a776]">.</span>
          </Link>

          {/* Desktop Pill — appears after scroll */}
          <AnimatePresence>
            {scrolled && (
              <motion.div
                initial={{ y: -10, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-[#09090f]/80 backdrop-blur-2xl border border-[rgba(255,255,255,0.06)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
              >
                <Link
                  href="/#catalog"
                  className="px-4 py-2 rounded-full font-mono text-[11px] tracking-[0.1em] uppercase text-[#8a877f] hover:text-[#eae8e4] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300"
                >
                  Catalog
                </Link>
                <Link
                  href="/#about"
                  className="px-4 py-2 rounded-full font-mono text-[11px] tracking-[0.1em] uppercase text-[#8a877f] hover:text-[#eae8e4] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300"
                >
                  About
                </Link>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-[#c4a776] text-[#030305] font-mono text-[11px] tracking-[0.1em] uppercase font-medium hover:bg-[#d4ba8a] transition-all duration-300"
                >
                  Talk to Us
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop nav links — visible before scroll */}
          <div className={`hidden md:flex items-center gap-8 transition-opacity duration-300 ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Link
              href="/#catalog"
              className="relative font-mono text-[11px] tracking-[0.12em] uppercase text-[#8a877f] hover:text-[#eae8e4] transition-colors duration-300 group"
            >
              Catalog
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c4a776] group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/#about"
              className="relative font-mono text-[11px] tracking-[0.12em] uppercase text-[#8a877f] hover:text-[#eae8e4] transition-colors duration-300 group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c4a776] group-hover:w-full transition-all duration-300" />
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[rgba(255,255,255,0.08)] text-[#eae8e4] font-mono text-[11px] tracking-[0.1em] uppercase rounded-full hover:border-[#c4a776] hover:text-[#c4a776] transition-all duration-400"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-60"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Talk to Us
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute block w-5 h-[1.5px] bg-[#eae8e4] transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute block w-5 h-[1.5px] bg-[#eae8e4] transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
              }`}
            />
            <span
              className={`absolute block w-5 h-[1.5px] bg-[#eae8e4] transition-all duration-300 ${
                menuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"
              }`}
            />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#030305] flex flex-col items-center justify-center"
          >
            {/* Decorative brass gradient */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_top_right,rgba(196,167,118,0.06),transparent_60%)]" />

            <nav className="flex flex-col items-center gap-12 relative z-10">
              {[
                { href: "/#catalog", label: "Catalog" },
                { href: "/#about", label: "About" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    duration: 0.5,
                    ease: EASE,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-5xl text-[#eae8e4] hover:text-[#c4a776] transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.35,
                  duration: 0.5,
                  ease: EASE,
                }}
              >
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#c4a776] text-[#030305] font-display text-lg rounded-full hover:bg-[#d4ba8a] transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Talk to Us
                </a>
              </motion.div>
            </nav>

            {/* Mono footer in mobile menu */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute bottom-8 font-mono text-[10px] tracking-[0.2em] uppercase text-[#4a4840]"
            >
              Est. 1994 &mdash; Mumbai
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
