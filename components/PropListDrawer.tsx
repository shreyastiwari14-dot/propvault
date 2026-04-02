"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePropList } from "./PropListContext";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function PropListDrawer() {
  const { items, count, isOpen, close, remove, clear, whatsappLink } = usePropList();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0c0c12] border-l border-[rgba(255,255,255,0.07)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.07)]">
              <div>
                <h2 className="font-display font-bold text-lg text-[#ededf0]">
                  Your Prop List
                </h2>
                <p className="font-mono text-xs text-[#55556a] mt-0.5">
                  {count} {count === 1 ? "item" : "items"} selected
                </p>
              </div>
              <button
                onClick={close}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.07)] text-[#8b8ba0] hover:text-white hover:border-[rgba(255,255,255,0.14)] transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-[#55556a] font-mono text-sm mb-2">
                    No props selected yet
                  </p>
                  <p className="text-[#55556a] text-xs">
                    Browse categories and tap the + button to add props
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.item_code}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#141420] border border-[rgba(255,255,255,0.05)]"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#0c0c12]">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-mono text-[10px] text-[#2a2a3a]">
                              {item.item_code}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-medium text-[#ededf0] truncate">
                          {item.name}
                        </p>
                        <p className="font-mono text-[11px] text-[#55556a]">
                          {item.item_code} • {item.category}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => remove(item.item_code)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#55556a] hover:text-[#ff5050] hover:bg-[rgba(255,80,80,0.08)] transition-all"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[rgba(255,255,255,0.07)] space-y-3">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full px-6 py-4 bg-[#25D366] text-white font-display font-semibold text-sm rounded-xl hover:bg-[#20bd5a] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.318A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.346 0-4.542-.671-6.405-1.826l-.447-.273-2.772.78.714-2.622-.3-.475A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Send Inquiry for {count} {count === 1 ? "Prop" : "Props"}
                </a>
                <button
                  onClick={clear}
                  className="w-full py-2.5 text-center font-mono text-xs text-[#55556a] hover:text-[#ff5050] transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
