'use client'
import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-mono tracking-wider uppercase text-[#8a877f]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 text-sm bg-[#09090f] border rounded-xl text-[#eae8e4]',
            'focus:outline-none focus:ring-2 focus:ring-[#c4a776]/40 focus:border-[#c4a776]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-300',
            error ? 'border-[#c45a3c]' : 'border-[rgba(255,255,255,0.08)]',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-[#c45a3c]">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
