'use client'
import { TrustBadgesCompact } from '@/components/shared/TrustBadges'

export function MataxeMethode() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[900px] mx-auto px-6">
        {/* Titre franc */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-3">
            Pourquoi nous sommes transparents sur la précision
          </h2>
          <p className="text-slate-muted text-base max-w-[640px] mx-auto leading-relaxed">
            La taxe foncière est calculée par l&apos;administration avec des paramètres que <strong>seule l&apos;administration connaît</strong> : le tarif au m² de votre commune (fixé en 1970), le coefficient de situation de votre rue, et la catégorie exacte de votre bien.
          </p>
          <p className="text-slate-text text-base max-w-[640px] mx-auto leading-relaxed mt-3 font-medium">
            Sans ces données, personne — ni nous, ni un cabinet à 500€ — ne peut vous donner un montant exact. La différence, c&apos;est qu&apos;on vous le dit.
          </p>
        </div>

        {/* Les 4 niveaux */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: '🥉', level: 'Bronze', score: '~40%',
              title: 'Caractéristiques du bien',
              desc: 'On détecte des indices d\'anomalies. L\'estimation financière est très approximative.',
              color: 'bg-amber-50 border-amber-200',
            },
            {
              icon: '🥈', level: 'Argent', score: '~60%',
              title: '+ Montant de la taxe',
              desc: 'On estime le % de réduction par anomalie. Le montant reste une fourchette.',
              color: 'bg-slate-bg border-slate-border',
            },
            {
              icon: '🥇', level: 'Or', score: '~80%',
              title: '+ Base nette (avis TF)',
              desc: 'Avec le vrai taux de votre commune, estimation précise à ±15-20%.',
              color: 'bg-yellow-50 border-yellow-200',
            },
            {
              icon: '💎', level: 'Platine', score: '~95%',
              title: '+ Formulaire 6675-M',
              desc: 'Comparaison paramètre par paramètre avec les données exactes de l\'admin.',
              color: 'bg-emerald/5 border-emerald/20',
            },
          ].map((l) => (
            <div key={l.level} className={`rounded-xl border p-5 ${l.color} text-center`}>
              <div className="text-2xl mb-2">{l.icon}</div>
              <div className="font-heading font-bold text-slate-text text-sm mb-0.5">{l.level}</div>
              <div className="font-heading font-extrabold text-emerald text-lg mb-2">{l.score}</div>
              <div className="text-xs font-semibold text-slate-text mb-1">{l.title}</div>
              <p className="text-[11px] text-slate-muted leading-relaxed">{l.desc}</p>
            </div>
          ))}
        </div>

        {/* Notre approche */}
        <div className="text-center mb-8">
          <h3 className="font-heading font-bold text-slate-text text-xl mb-3">Notre approche : plus vous nous donnez, plus c&apos;est précis</h3>
          <p className="text-slate-muted text-sm max-w-[540px] mx-auto">
            Et on vous aide gratuitement à obtenir le document clé (formulaire 6675-M) pour atteindre 95% de fiabilité.
          </p>
        </div>

        {/* Comment ça marche en 3 étapes */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '📋', title: 'Décrivez votre bien', desc: 'Remplissez le formulaire en 2 minutes. Plus vous avez d\'infos (base nette de votre avis), plus c\'est précis.' },
            { icon: '🎯', title: 'Pré-diagnostic transparent', desc: 'Résultat immédiat et gratuit. On vous montre exactement ce qu\'on sait, ce qu\'on ne sait pas, et la fiabilité du résultat.' },
            { icon: '📄', title: 'On vous aide à aller plus loin', desc: 'On génère gratuitement la lettre pour demander votre 6675-M. Revenez avec → rapport + réclamation pour 49€.' },
          ].map((s) => (
            <div key={s.title} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald/10 flex items-center justify-center text-2xl mx-auto mb-4">
                {s.icon}
              </div>
              <div className="font-heading font-bold text-slate-text text-base mb-2">{s.title}</div>
              <p className="text-sm text-slate-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <TrustBadgesCompact />
      </div>
    </section>
  )
}
