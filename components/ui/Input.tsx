'use client'
import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'floating' | 'dark'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, variant = 'dark', className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const [focused, setFocused] = useState(false)
    const hasValue = props.value !== undefined && props.value !== ''

    if (variant === 'floating') {
      return (
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'peer w-full px-4 pt-6 pb-2 text-sm bg-[#09090f] border rounded-xl text-[#eae8e4] placeholder-transparent',
              'focus:outline-none focus:ring-2 focus:ring-[#c4a776]/40 focus:border-[#c4a776]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-300',
              error ? 'border-[#c45a3c]' : 'border-[rgba(255,255,255,0.08)]',
              className
            )}
            placeholder={label}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none',
                'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#4a4840]',
                'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-[#c4a776] peer-focus:tracking-wider peer-focus:uppercase peer-focus:font-mono',
                (focused || hasValue) ? 'top-2 translate-y-0 text-[10px] tracking-wider uppercase font-mono text-[#c4a776]' : 'top-1/2 -translate-y-1/2 text-sm text-[#4a4840]'
              )}
            >
              {label}
            </label>
          )}
          {error && <p className="mt-1.5 text-xs text-[#c45a3c]">{error}</p>}
          {hint && !error && <p className="mt-1.5 text-xs text-[#4a4840]">{hint}</p>}
        </div>
      )
    }

    // Dark variant (default for PropVault)
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono tracking-wider uppercase text-[#8a877f]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 text-sm bg-[#09090f] border rounded-xl text-[#eae8e4] placeholder-[#4a4840]',
            'focus:outline-none focus:ring-2 focus:ring-[#c4a776]/40 focus:border-[#c4a776]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-300',
            error ? 'border-[#c45a3c]' : 'border-[rgba(255,255,255,0.08)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#c45a3c]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#4a4840]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
