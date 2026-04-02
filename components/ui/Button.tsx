'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a776] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030305] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

    const variants = {
      primary: 'bg-[#eae8e4] text-[#030305] hover:bg-white',
      secondary: 'bg-transparent text-[#eae8e4] border border-[rgba(255,255,255,0.1)] hover:border-[rgba(196,167,118,0.4)] hover:text-[#c4a776]',
      ghost: 'text-[#8a877f] hover:text-[#eae8e4] hover:bg-[rgba(255,255,255,0.04)]',
      danger: 'bg-[#c45a3c] text-white hover:bg-[#d4633f]',
      accent: 'bg-[#c4a776] text-[#030305] hover:bg-[#d4ba8a] hover:shadow-[0_0_40px_rgba(196,167,118,0.15)]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs tracking-wide',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-4 text-sm font-semibold tracking-wide',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
