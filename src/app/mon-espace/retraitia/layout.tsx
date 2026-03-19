"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DossierProvider, useDossier } from '@/lib/retraitia/DossierContext'

const NAV_ITEMS = [
  { href: '/mon-espace/retraitia', label: 'Tableau de bord', icon: '📊' },
  { href: '/mon-espace/retraitia/documents', label: 'Documents', icon: '📎' },
  { href: '/mon-espace/retraitia/informations', label: 'Informations', icon: '📝' },
  { href: '/mon-espace/retraitia/diagnostic', label: 'Diagnostic', icon: '🔍' },
  { href: '/mon-espace/retraitia/demarches', label: 'Demarches', icon: '📨', requiresPack49: true },
  { href: '/mon-espace/retraitia/rapport', label: 'Rapport', icon: '📄', requiresPack49: true },
]

function RetraitiaNav() {
  const pathname = usePathname()
  const { dossier } = useDossier()
  const pack49Paid = dossier?.pack49Paid || dossier?.seuilGratuit || false

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.href || (item.href !== '/mon-espace/retraitia' && pathname?.startsWith(item.href))
        const isExact = pathname === item.href
        const active = item.href === '/mon-espace/retraitia' ? isExact : isActive
        const locked = item.requiresPack49 && !pack49Paid

        if (locked) {
          return (
            <span
              key={item.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-muted/50 cursor-not-allowed whitespace-nowrap"
              title="Se debloque avec le Pack Action (49€)"
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
            className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors " + (
              active
                ? 'bg-emerald/10 text-emerald'
                : 'text-slate-muted hover:bg-slate-50 hover:text-slate-text'
            )}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function RetraitiaEspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <DossierProvider>
      <div>
        {/* Header RETRAITIA */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald font-heading font-extrabold text-lg">RETRAITIA</span>
            <span className="text-slate-muted text-xs">— Audit pension de retraite</span>
          </div>
          <RetraitiaNav />
        </div>
        {children}
      </div>
    </DossierProvider>
  )
}
