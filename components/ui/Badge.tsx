import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'free' | 'starter' | 'pro' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-surface-raised text-gray-300 border border-surface-border': variant === 'default',
          'bg-gray-800 text-gray-400': variant === 'free',
          'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50': variant === 'starter',
          'bg-purple-900/60 text-purple-300 border border-purple-700/50': variant === 'pro',
          'border border-surface-border text-gray-400': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
