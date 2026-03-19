'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { UserMenu } from '@/components/auth/UserMenu'

const homeLinks = [
  { href: '#services', label: 'Services' },
  { href: '#comment', label: 'Comment ça marche' },
  { href: '#tarifs', label: 'Tarifs' },
]

const briqueLinks: Record<string, { links: Array<{ href: string; label: string }>; cta: { href: string; label: string } }> = {
  '/retraitia': {
    links: [
      { href: '#upload', label: 'Déposer mes documents' },
      { href: '#formulaire', label: 'Formulaire' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#upload', label: 'Vérifier ma pension' },
  },
  '/monloyer': {
    links: [
      { href: '#formulaire', label: 'Vérifier mon loyer' },
      { href: '#villes', label: 'Villes concernées' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#formulaire', label: 'Vérifier gratuitement' },
  },
  '/macaution': {
    links: [
      { href: '#formulaire', label: 'Analyser ma situation' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#formulaire', label: 'Diagnostic gratuit' },
  },
  '/mataxe': {
    links: [
      { href: '#formulaire', label: 'Vérifier ma taxe' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#formulaire', label: 'Vérifier gratuitement' },
  },
  '/mapension': {
    links: [
      { href: '#formulaire', label: 'Calculer ma pension' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#formulaire', label: 'Calculer gratuitement' },
  },
  '/mabanque': {
    links: [
      { href: '#upload', label: 'Déposer mon relevé' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#upload', label: 'Analyser mes frais' },
  },
  '/monimpot': {
    links: [
      { href: '#formulaire', label: 'Vérifier ma déclaration' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#formulaire', label: 'Audit gratuit' },
  },
  '/monchomage': {
    links: [
      { href: '#upload', label: 'Déposer mes documents' },
      { href: '#faq', label: 'FAQ' },
    ],
    cta: { href: '#upload', label: 'Vérifier mes allocations' },
  },
}

const servicesDropdown = [
  { href: '/retraitia', label: 'RETRAITIA', desc: 'Audit pension de retraite' },
  { href: '/macaution', label: 'MACAUTION', desc: 'Récupérer son dépôt de garantie' },
  { href: '/monloyer', label: 'MONLOYER', desc: 'Encadrement des loyers — Gratuit' },
  { href: '/mataxe', label: 'MATAXE', desc: 'Taxe foncière — Pré-diag gratuit' },
  { href: '/mapension', label: 'MAPENSION', desc: 'Pension alimentaire — Calcul gratuit' },
  { href: '/mabanque', label: 'MABANQUE', desc: 'Frais bancaires — Audit express' },
  { href: '/monimpot', label: 'MONIMPÔT', desc: 'Déclaration revenus — Audit gratuit' },
  { href: '/monchomage', label: 'MONCHOMAGE', desc: 'Allocations chômage — Vérification' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()

  const briqueKey = Object.keys(briqueLinks).find(k => pathname.startsWith(k))
  const currentBrique = briqueKey ? briqueLinks[briqueKey] : null
  const isMonEspace = pathname.startsWith('/mon-espace')
  const navItems = currentBrique ? currentBrique.links : (isMonEspace ? [] : homeLinks)
  const ctaLink = currentBrique ? currentBrique.cta : (isMonEspace ? null : { href: '#diagnostic', label: 'Diagnostic gratuit' })

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/images/logo-recupeo.png" alt="RÉCUPÉO" width={40} height={40} className="rounded-lg" />
          <span className="font-heading text-white text-xl font-bold tracking-tight">RÉCUPÉO</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {/* Dropdown Nos services */}
          <div className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="text-white/70 text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
              Nos services
              <svg className={`w-3.5 h-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-navy-dark/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                {servicesDropdown.map(s => (
                  <Link key={s.href} href={s.href} className="block px-4 py-3 hover:bg-white/5 transition-colors no-underline">
                    <div className="text-emerald text-sm font-bold">{s.label}</div>
                    <div className="text-white/50 text-xs mt-0.5">{s.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Liens contextuels */}
          {navItems.map((l) => (
            <a key={l.href} href={l.href} className="text-white/70 text-sm font-medium hover:text-white transition-colors">{l.label}</a>
          ))}

          {/* CTA ou UserMenu */}
          {ctaLink && (
            <a href={ctaLink.href} className="cta-primary !py-2.5 !px-5 !text-sm !rounded-lg">{ctaLink.label}</a>
          )}

          <UserMenu />
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2" aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-dark/95 backdrop-blur-xl border-t border-white/[0.06] px-6 py-6">
          <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Nos services</div>
          {servicesDropdown.map(s => (
            <Link key={s.href} href={s.href} onClick={() => setMobileOpen(false)} className="block py-2 no-underline">
              <span className="text-emerald text-sm font-bold">{s.label}</span>
              <span className="text-white/40 text-xs ml-2">{s.desc}</span>
            </Link>
          ))}
          <div className="border-t border-white/10 my-3" />
          {navItems.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-3 text-white/70 text-base font-medium hover:text-white">{l.label}</a>
          ))}
          {ctaLink && (
            <a href={ctaLink.href} onClick={() => setMobileOpen(false)} className="cta-primary mt-4 w-full justify-center">{ctaLink.label}</a>
          )}
          <div className="border-t border-white/10 my-3" />
          <div className="flex justify-center">
            <UserMenu />
          </div>
        </div>
      )}
    </nav>
  )
}
