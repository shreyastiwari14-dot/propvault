'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: string
  item_code: string
  name: string
  category_slug: string
  image_url: string | null
  quantity: number
  max_qty: number
  status: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (item_code: string) => void
  updateQty: (item_code: string, qty: number) => void
  clearCart: () => void
  isInCart: (item_code: string) => boolean
  total: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.item_code === item.item_code)
      if (existing) return prev
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeFromCart = useCallback((item_code: string) => {
    setCart(prev => prev.filter(i => i.item_code !== item_code))
  }, [])

  const updateQty = useCallback((item_code: string, qty: number) => {
    setCart(prev => prev.map(i =>
      i.item_code === item_code
        ? { ...i, quantity: Math.max(1, Math.min(qty, i.max_qty)) }
        : i
    ))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])
  const isInCart = useCallback((item_code: string) => cart.some(i => i.item_code === item_code), [cart])
  const total = cart.length

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      isInCart, total, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
