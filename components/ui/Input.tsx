'use client'
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#111110]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white border rounded-lg text-[#111110] placeholder-[#8A8A84]',
            'focus:outline-none focus:ring-2 focus:ring-[#D4501A] focus:border-transparent',
            'disabled:bg-[#F7F6F3] disabled:cursor-not-allowed',
            error ? 'border-[#EF4444]' : 'border-[#E5E3DE]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#8A8A84]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
