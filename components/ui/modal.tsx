'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  /** Prevent closing by clicking the backdrop */
  preventBackdropClose?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  preventBackdropClose = false,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  // Sync open state with native dialog
  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Close on Escape key
  React.useEffect(() => {
    const dialog = dialogRef.current
    const handleClose = () => onClose()
    dialog?.addEventListener('close', handleClose)
    return () => dialog?.removeEventListener('close', handleClose)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (preventBackdropClose) return
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        // Reset native dialog styles
        'bg-transparent p-0 max-w-none backdrop:bg-neutral-950/70 backdrop:backdrop-blur-sm',
        // Modal container
        'fixed inset-0 z-50 flex items-center justify-center',
      )}
    >
      <div
        className={cn(
          'relative w-full max-w-md mx-4',
          'bg-surface border border-border rounded-xl shadow-lg',
          'animate-fade-in',
          className,
        )}
        role="document"
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-border">
            {title && (
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className={cn(
            'absolute top-4 right-4 p-1 rounded-md',
            'text-text-muted hover:text-text-primary hover:bg-surface-elevated',
            'transition-colors duration-150',
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </dialog>
  )
}

/** Simple confirm modal for destructive actions */
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex gap-3 justify-end mt-2">
        <button
          onClick={onClose}
          className="h-9 px-4 text-sm font-medium rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          aria-busy={loading}
          className="h-9 px-4 text-sm font-medium rounded-md bg-danger-600 text-white hover:bg-danger-500 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
