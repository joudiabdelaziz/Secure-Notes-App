import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-8',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-surface-elevated text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
