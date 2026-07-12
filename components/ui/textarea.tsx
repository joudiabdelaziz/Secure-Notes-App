'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
  maxLength?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, label, error, hint, showCount, maxLength, id, value, onChange, ...props },
    ref,
  ) {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const errorId = `${textareaId}-error`
    const hintId = `${textareaId}-hint`
    const [charCount, setCharCount] = React.useState(
      typeof value === 'string' ? value.length : 0,
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          aria-describedby={
            [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full rounded-md border bg-surface px-4 py-3 text-sm',
            'text-text-primary placeholder:text-text-muted',
            'border-border transition-colors duration-150',
            'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
            'resize-none disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[200px]',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between">
          <div>
            {error && (
              <p id={errorId} className="text-xs text-danger-500" role="alert">
                {error}
              </p>
            )}
            {hint && !error && (
              <p id={hintId} className="text-xs text-text-muted">
                {hint}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <span
              className={cn(
                'text-xs tabular-nums',
                charCount >= maxLength * 0.9
                  ? 'text-warning-500'
                  : 'text-text-muted',
                charCount >= maxLength && 'text-danger-500',
              )}
            >
              {charCount.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    )
  },
)
