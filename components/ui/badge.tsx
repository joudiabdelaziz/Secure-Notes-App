import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-surface-elevated text-text-secondary border border-border',
  primary:  'bg-primary-950 text-primary-300 border border-primary-800',
  success:  'bg-success-600/10 text-success-400 border border-success-600/30',
  warning:  'bg-warning-600/10 text-warning-300 border border-warning-600/30',
  danger:   'bg-danger-600/10 text-danger-400 border border-danger-600/30',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  onRemove?: () => void
}

export function Badge({
  children,
  variant = 'default',
  className,
  onRemove,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="ml-0.5 -mr-0.5 rounded-full hover:opacity-70 transition-opacity focus:outline-none focus:ring-1 focus:ring-current"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M8.854 3.146a.5.5 0 0 0-.708 0L6 5.293 3.854 3.146a.5.5 0 0 0-.708.708L5.293 6 3.146 8.146a.5.5 0 1 0 .708.708L6 6.707l2.146 2.147a.5.5 0 0 0 .708-.708L6.707 6l2.147-2.146a.5.5 0 0 0 0-.708z" />
          </svg>
        </button>
      )}
    </span>
  )
}
