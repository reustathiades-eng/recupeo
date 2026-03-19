'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/mon-espace/retraitia', label: 'Tableau de bord', icon: '📊' },
  { href: '/mon-espace/retraitia/documents', label: 'Documents', icon: '📎' },
  { href: '/mon-espace/retraitia/informations', label: 'Informations', icon: '📝' },
  { href: '/mon-espace/retraitia/diagnostic', label: 'Diagnostic', icon: '🔍' },
  { href: '/mon-espace/retraitia/demarches', label: 'Démarches', icon: '📨', locked: true },
  { href: '/mon-espace/retraitia/rapport', label: 'Rapport', icon: '📄', locked: true },
]

export default function RetraitiaEspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      {/* Header RETRAITIA */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald font-heading font-extrabold text-lg">RETRAITIA</span>
          <span className="text-slate-muted text-xs">— Audit pension de retraite</span>
        </div>

        {/* Navigation horizontale */}
        <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/mon-espace/retraitia' && pathname?.startsWith(item.href))
            const isExact = pathname === item.href
            const active = item.href === '/mon-espace/retraitia' ? isExact : isActive

            if (item.locked) {
              return (
                <span
                  key={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-muted/50 cursor-not-allowed whitespace-nowrap"
                  title="Se débloque avec le Pack Action (49€)"
                >
                  <span className="text-xs">🔒</span>
                  {item.label}
                </span>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-emerald/10 text-emerald'
                    : 'text-slate-muted hover:bg-slate-50 hover:text-slate-text'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Contenu */}
      {children}
    </div>
  )
}
