'use client'
import { useCart } from './CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartFab() {
  const { total, openCart, isOpen } = useCart()

  if (total === 0 || isOpen) return null

  return (
    <motion.button
      onClick={openCart}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 bg-[#E94560] hover:bg-[#d63a54] text-white pl-4 pr-3 py-3 rounded-full shadow-2xl shadow-[#E94560]/20 transition-colors"
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <span className="text-sm font-semibold">Book {total} Prop{total !== 1 ? 's' : ''}</span>
      <span className="bg-white/20 text-xs font-mono px-1.5 py-0.5 rounded-full">{total}</span>
    </motion.button>
  )
}
