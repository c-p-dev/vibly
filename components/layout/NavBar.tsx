'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useEntitlements } from '@/hooks/useEntitlements'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import type { Plan } from '@/lib/entitlements'

const NAV_LINKS = [
  { href: '/player', label: 'Player' },
  { href: '/stacks', label: 'Stacks' },
]

export function NavBar() {
  const pathname = usePathname()
  const { user } = useSupabaseUser()
  const { plan } = useEntitlements()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">🎵</span>
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent text-lg">
            Vibly
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-surface-raised text-white'
                  : 'text-gray-400 hover:text-white hover:bg-surface-raised'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-surface-raised transition-colors"
              >
                <span className="hidden sm:block truncate max-w-[120px]">
                  {user.email?.split('@')[0]}
                </span>
                <PlanBadge plan={plan} />
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl bg-surface-raised border border-surface-border shadow-xl py-1">
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-hover"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account
                    </Link>
                    <Link
                      href="/account/billing"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-hover"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Billing
                    </Link>
                    <hr className="my-1 border-surface-border" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-surface-hover"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-surface-raised transition-colors"
            >
              Sign in
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-surface-raised sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-surface-border bg-surface px-4 py-3 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-surface-raised"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

function PlanBadge({ plan }: { plan: Plan }) {
  if (plan === 'free') return null
  return (
    <Badge variant={plan} className="text-[10px] px-1.5 py-0">
      {plan}
    </Badge>
  )
}
