'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { clearKey, hasKey } from '@/lib/crypto/key-store'
import type { Folder } from '@/types/folders'
import { CreateFolderModal } from '@/components/folders/create-folder-modal'

interface SidebarProps {
  folders: Folder[]
  activeFolderId?: string | null
  activeTag?: string | null
  allTags: string[]
}

export function Sidebar({ folders, activeFolderId, activeTag, allTags }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const unlocked = hasKey()

  function handleLockVault() {
    clearKey()
    toast.success('Vault locked successfully')
    router.push('/notes')
    router.refresh()
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      clearKey() // Wipe in-memory encryption key
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out.')
      setLoggingOut(false)
    }
  }

  const isNotesRoot = pathname === '/notes'

  return (
    <>
      <aside className="flex flex-col h-full w-full bg-surface border-r border-border overflow-y-auto">
        {/* Logo & Vault status */}
        <div className="px-4 py-5 border-b border-border flex flex-col gap-3">
          <Link
            href="/notes"
            className="flex items-center gap-2.5 font-bold text-text-primary hover:text-primary-400 transition-colors"
          >
            <span className="text-2xl">🔒</span>
            <span className="text-base">SecureNotes</span>
          </Link>

          {/* Glowing vault status badge */}
          {unlocked ? (
            <button
              onClick={handleLockVault}
              title="Click to lock your vault immediately"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-success-600/30 bg-success-600/10 text-success-400 text-xs font-semibold hover:bg-danger-600/10 hover:border-danger-600/30 hover:text-danger-400 transition-all group"
            >
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                </span>
                <span>Vault Unlocked</span>
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Lock 🔒</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-warning-600/30 bg-warning-600/10 text-warning-400 text-xs font-semibold w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-500"></span>
              </span>
              <span>Vault Locked</span>
            </div>
          )}
        </div>

        {/* New note CTA */}
        <div className="px-3 py-3">
          <Link
            href="/notes/new"
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium',
              'bg-primary-600 text-white hover:bg-primary-500 transition-colors',
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-3 flex flex-col gap-1">
          {/* All Notes */}
          <NavItem
            href="/notes"
            active={isNotesRoot && !activeFolderId && !activeTag}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            All Notes
          </NavItem>

          {/* Folders section */}
          <div className="pt-3 pb-1">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Folders
              </span>
              <button
                onClick={() => setCreateFolderOpen(true)}
                aria-label="Create folder"
                className="p-0.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {folders.length === 0 ? (
              <p className="px-2 text-xs text-text-muted italic">No folders yet</p>
            ) : (
              folders.map((folder) => (
                <NavItem
                  key={folder.id}
                  href={`/notes?folder=${folder.id}`}
                  active={activeFolderId === folder.id}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0012.828 8H19a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                  }
                >
                  {folder.name}
                </NavItem>
              ))
            )}
          </div>

          {/* Tags section */}
          {allTags.length > 0 && (
            <div className="pt-2 pb-1">
              <div className="px-2 mb-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Tags
                </span>
              </div>
              {allTags.map((tag) => (
                <NavItem
                  key={tag}
                  href={`/notes?tag=${encodeURIComponent(tag)}`}
                  active={activeTag === tag}
                  icon={
                    <span className="text-text-muted">#</span>
                  }
                >
                  {tag}
                </NavItem>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-border flex flex-col gap-1">
          <Link
            href="/folders"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary',
              'hover:bg-surface-elevated hover:text-text-primary transition-colors',
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Folders
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-secondary',
              'hover:bg-surface-elevated hover:text-danger-400 transition-colors',
              'disabled:opacity-50',
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
      />
    </>
  )
}

// ─── NavItem ──────────────────────────────────────────────────

function NavItem({
  href,
  active,
  icon,
  children,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-primary-950 text-primary-300 font-medium'
          : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{children}</span>
    </Link>
  )
}
