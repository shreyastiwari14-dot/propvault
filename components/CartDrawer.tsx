'use client'
import { useCart } from './CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeFromCart, updateQty, total } = useCart()

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
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#090910] border-l border-[#2A2A3A] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A3A]">
              <div>
                <h2 className="text-[#F0F0F5] font-semibold tracking-wide">Booking Cart</h2>
                <p className="text-xs font-mono text-[#7070A0] mt-0.5">{total} prop{total !== 1 ? 's' : ''} selected</p>
              </div>
              <button onClick={closeCart} className="w-8 h-8 flex items-center justify-center text-[#7070A0] hover:text-[#F0F0F5] transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-12 h-12 rounded-full border border-[#2A2A3A] flex items-center justify-center mb-4">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                  </div>
                  <p className="text-[#7070A0] text-sm font-mono">Your cart is empty</p>
                  <p className="text-[#555568] text-xs mt-1">Browse props and add them here</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.item_code}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 bg-[#111118] border border-[#2A2A3A] rounded-lg p-3"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-[#1A1A24] shrink-0 relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#2A2A3A]">
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[#C8902A] text-xs font-mono">{item.item_code}</span>
                          <p className="text-[#F0F0F5] text-sm font-medium leading-snug mt-0.5 line-clamp-1">{item.name}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.item_code)}
                          className="text-[#555568] hover:text-[#C8902A] transition-colors shrink-0 mt-0.5"
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6 6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>

                      {/* Qty control */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#555568] font-mono">Qty:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQty(item.item_code, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-5 h-5 rounded border border-[#2A2A3A] text-[#7070A0] hover:border-[#7070A0] disabled:opacity-30 flex items-center justify-center text-xs transition-colors"
                          >−</button>
                          <span className="font-mono text-xs text-[#F0F0F5] w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.item_code, item.quantity + 1)}
                            disabled={item.quantity >= item.max_qty}
                            className="w-5 h-5 rounded border border-[#2A2A3A] text-[#7070A0] hover:border-[#7070A0] disabled:opacity-30 flex items-center justify-center text-xs transition-colors"
                          >+</button>
                        </div>
                        <span className="text-xs text-[#555568] font-mono">of {item.max_qty}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-[#2A2A3A] space-y-3">
                <Link
                  href="/book"
                  onClick={closeCart}
                  className="block w-full bg-[#C8902A] hover:bg-[#B8801E] text-white font-semibold py-3.5 px-6 rounded-lg text-center transition-colors text-sm tracking-wide"
                >
                  Book {total} Prop{total !== 1 ? 's' : ''} Together →
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-xs font-mono text-[#555568] hover:text-[#7070A0] transition-colors py-1"
                >
                  Continue Browsing
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
