'use client'
// ============================================================
// RÉCUPÉO — Menu utilisateur Navbar
// ============================================================
// Non connecté : bouton "Se connecter"
// Connecté : dropdown avec liens mon-espace + déconnexion
// ============================================================

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './useAuth'

export function UserMenu() {
  const { authenticated, user, loading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (loading) {
    return <div className="w-20 h-9" /> // Placeholder pour éviter le layout shift
  }

  if (!authenticated) {
    return (
      <Link
        href="/connexion"
        className="text-white/70 text-sm font-medium hover:text-white transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Se connecter
      </Link>
    )
  }

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Mon espace'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-emerald/20 flex items-center justify-center">
          <span className="text-emerald text-xs font-bold">
            {(user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:inline">{displayName}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-navy-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-medium truncate">{displayName}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>

          <div className="py-1">
            {[
              { href: '/mon-espace/tableau-de-bord', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { href: '/mon-espace/mes-diagnostics', label: 'Mes diagnostics', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { href: '/mon-espace/mes-demarches', label: 'Mes démarches', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors no-underline"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 py-1">
            <button
              onClick={async () => {
                setOpen(false)
                await logout()
                window.location.href = '/'
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors w-full text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
