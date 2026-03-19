import Image from 'next/image'
import Link from 'next/link'
import { SITE } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-navy-dark border-t border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/images/logo-recupeo.png" alt="RÉCUPÉO" width={30} height={30} className="rounded-lg" />
              <span className="font-heading text-white text-lg font-bold">{SITE.name}</span>
            </div>
            <p className="text-[13px] text-white/40 leading-relaxed">{SITE.description}<br />{SITE.tagline}</p>
          </div>
          <div>
            <h5 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Services</h5>
            <div className="flex flex-col gap-2.5">
              <Link href="/macaution" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Dépôt de garantie</Link>
              <Link href="/retraitia" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Pension retraite</Link>
              <Link href="/monloyer" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Encadrement loyers</Link>
              <Link href="/mataxe" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Taxe foncière</Link>
              <Link href="/mapension" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Pension alimentaire</Link>
              <span className="text-white/20 text-[13px]">Chômage (bientôt)</span>
            </div>
          </div>
          <div>
            <h5 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Légal</h5>
            <div className="flex flex-col gap-2.5">
              <Link href="/mentions-legales" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Mentions légales</Link>
              <Link href="/cgu" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">CGU / CGV</Link>
              <Link href="/confidentialite" className="text-white/40 text-[13px] hover:text-white/70 transition-colors">Politique de confidentialité</Link>
            </div>
          </div>
          <div>
            <h5 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Contact</h5>
            <a href={`mailto:${SITE.email}`} className="text-white/40 text-[13px] hover:text-white/70">{SITE.email}</a>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} {SITE.name}. Tous droits réservés.</p>
          <p className="text-[11px] text-white/20 max-w-[480px] text-center sm:text-right">Audit indicatif ne constituant pas un avis juridique. Données traitées conformément au RGPD.</p>
        </div>
      </div>
    </footer>
  )
}
