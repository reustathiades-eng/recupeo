'use client'

import { track } from '@/lib/analytics'
import { fmt } from '@/lib/format'

const stats = [
  { value: '33%', label: 'des salariés ont une erreur sur leur fiche de paie', source: 'IFOP/Securex' },
  { value: '69%', label: 'ne comprennent pas totalement leur bulletin', source: 'Ipsos/PayFit 2025' },
  { value: `${fmt(1800)}\u2013${fmt(7200)}\u00a0€`, label: 'récupérables en moyenne sur 3 ans', source: 'estimation RECUPEO' },
]

const errors = [
  'Heures sup non payées ou mal majorées',
  'Convention collective mal appliquée',
  'Primes oubliées (13e mois, ancienneté)',
  'Congés payés mal comptabilisés',
]

export default function Hero() {
  const handleCTA = () => {
    track({ event: 'mapaie_cta_click', brique: 'mapaie', context: 'mapaie_hero_primary' })
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSecondary = () => {
    track({ event: 'mapaie_cta_click', brique: 'mapaie', context: 'mapaie_hero_secondary' })
    document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-[#0B1426] text-white pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-3xl">
          <span className="inline-block bg-[#00D68F]/10 text-[#00D68F] font-body text-sm font-semibold px-3 py-1 rounded-full mb-6 border border-[#00D68F]/20">
            Audit de bulletin de paie
          </span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Votre employeur vous doit{' '}
            <span className="text-[#00D68F]">peut-être des milliers d'euros.</span>
          </h1>
          <p className="font-body text-lg text-slate-300 mb-4 leading-relaxed">
            1 salarié sur 3 a une erreur sur sa fiche de paie. Heures sup non payées, primes oubliées,
            convention collective mal appliquée — vous avez <strong className="text-white">3 ans pour réclamer</strong>.
          </p>
          <p className="font-body text-sm text-[#64748B] mb-8">
            L'acceptation du bulletin ne vaut pas renonciation à vos droits (art. L.3243-3 Code du travail).
          </p>

          <ul className="mb-8 space-y-2" aria-label="Erreurs fréquentes détectées">
            {errors.map((e) => (
              <li key={e} className="flex items-center gap-2 font-body text-sm text-slate-300">
                <span className="w-4 h-4 rounded-full bg-[#00D68F]/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <span className="w-2 h-2 rounded-full bg-[#00D68F] block" />
                </span>
                {e}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCTA}
              className="bg-[#00D68F] hover:bg-[#00D68F]/90 text-[#0B1426] font-body font-bold px-8 py-4 rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-[#00D68F] focus:ring-offset-2 focus:ring-offset-[#0B1426]"
              aria-label="Lancer mon audit de bulletin de paie gratuit"
            >
              Auditer mes fiches de paie — gratuit
            </button>
            <button
              onClick={handleSecondary}
              className="border border-white/20 hover:border-white/40 text-white font-body font-medium px-8 py-4 rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#0B1426]"
            >
              Comment ça marche ?
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6" role="list" aria-label="Statistiques clés">
          {stats.map((s) => (
            <div
              key={s.value}
              role="listitem"
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <p className="font-heading text-3xl font-bold text-[#00D68F] mb-2">{s.value}</p>
              <p className="font-body text-sm text-slate-300 mb-3 leading-snug">{s.label}</p>
              <p className="font-body text-xs text-[#64748B]">Source : {s.source}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 font-body text-xs text-[#64748B] text-center">
          Vous avez un litige sur votre contrat de travail ?{' '}
          <a href="/maprud" className="text-[#00D68F] underline underline-offset-2 hover:text-[#00D68F]/80 transition-colors">
            Découvrez aussi MAPRUD →
          </a>
        </p>
      </div>
    </section>
  )
}