'use client'

import { cn } from '@/lib/utils'

interface VolumeSliderProps {
  value: number
  onChange: (v: number) => void
  label: string
  min?: number
  max?: number
  className?: string
  showValue?: boolean
  disabled?: boolean
}

export function VolumeSlider({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  className,
  showValue = false,
  disabled = false,
}: VolumeSliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label className="sr-only" htmlFor={`slider-${label}`}>
        {label}
      </label>
      <svg
        className="h-4 w-4 flex-shrink-0 text-gray-500"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {value === 0 ? (
          <path
            fillRule="evenodd"
            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
            clipRule="evenodd"
          />
        )}
      </svg>
      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}%`}
        style={{
          background: `linear-gradient(to right, #6366f1 ${pct}%, #2a2a3d ${pct}%)`,
        }}
        className={cn(
          'h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none',
          'disabled:cursor-not-allowed disabled:opacity-40',
          '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
          '[&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer'
        )}
      />
      {showValue && (
        <span className="w-8 text-right text-xs text-gray-400">{value}</span>
      )}
    </div>
  )
}
