import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation et de Vente — RÉCUPÉO",
  description: "CGU et CGV de RÉCUPÉO — Conditions d'utilisation du service, tarifs, droit de rétractation.",
  alternates: { canonical: 'https://recupeo.fr/cgu' },
}

export default function CGUPage() {
  return (
    <div className="bg-slate-bg min-h-screen">
      <section className="hero-gradient py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">Conditions Générales d&apos;Utilisation et de Vente</h1>
          <p className="text-white/50 mt-3 text-sm">Dernière mise à jour : mars 2026</p>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-slate-border p-8 sm:p-12 space-y-10">

          <Article title="1. Objet">
            <p>Les présentes conditions générales régissent l&apos;utilisation du site <strong>recupeo.fr</strong> et les prestations de services proposées par RÉCUPÉO.</p>
            <p>RÉCUPÉO est un service en ligne d&apos;aide à la vérification de documents administratifs et fiscaux par intelligence artificielle. Il permet de détecter des anomalies potentielles et de générer des courriers de réclamation.</p>
          </Article>

          <Article title="2. Éditeur">
            <p><strong>RÉCUPÉO</strong> — Micro-entreprise — Romain EUSTATHIADES</p>
            <p>SIRET : <span className="text-slate-muted italic">[en cours d&apos;attribution]</span></p>
            <p>Email : <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a></p>
          </Article>

          <Article title="3. Services proposés">
            <p>RÉCUPÉO propose plusieurs modules d&apos;analyse :</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>MATAXE</strong> — Vérification de la taxe foncière (pré-diagnostic gratuit, rapport complet : 49 €)</li>
              <li><strong>MACAUTION</strong> — Analyse du dépôt de garantie (pré-diagnostic gratuit, rapport : 29 € ou 49 €)</li>
              <li><strong>RETRAITIA</strong> — Audit de pension de retraite (pré-diagnostic gratuit, rapport : 79 €, 149 € ou 199 €)</li>
              <li><strong>MONLOYER</strong> — Vérification de l&apos;encadrement des loyers (vérification gratuite, courriers recommandés : 29 €)</li>
            </ul>
            <p className="mt-3">Chaque module comprend un <strong>pré-diagnostic gratuit</strong> permettant d&apos;évaluer la situation avant tout achat.</p>
          </Article>

          <Article title="4. Tarifs et paiement">
            <p>Les prix indiqués sont en euros TTC (TVA non applicable, article 293 B du CGI — régime micro-entreprise).</p>
            <p>Le paiement s&apos;effectue en ligne par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>. Le paiement est exigé avant la délivrance du rapport complet.</p>
            <p>RÉCUPÉO se réserve le droit de modifier ses tarifs à tout moment. Les prix applicables sont ceux affichés au moment de la commande.</p>
          </Article>

          <Article title="5. Droit de rétractation">
            <p>Conformément à l&apos;article L.221-18 du Code de la consommation, vous disposez d&apos;un délai de <strong>14 jours</strong> à compter de la date d&apos;achat pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.</p>
            <p>Pour exercer ce droit, envoyez un email à <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a> en précisant votre nom, la date d&apos;achat et le service concerné.</p>
            <p>Le remboursement sera effectué dans un délai de 14 jours suivant la réception de votre demande, via le même moyen de paiement que celui utilisé pour la transaction initiale.</p>
          </Article>

          <Article title="6. Nature du service — Limitation de responsabilité">
            <p>RÉCUPÉO fournit un <strong>outil d&apos;aide à la décision</strong> basé sur l&apos;intelligence artificielle. Les résultats (pré-diagnostics, rapports, courriers) constituent une aide indicative et ne sauraient en aucun cas :</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li>Se substituer à un avis juridique, fiscal ou comptable professionnel</li>
              <li>Constituer une consultation juridique au sens de la loi</li>
              <li>Garantir un résultat auprès des administrations ou tiers</li>
            </ul>
            <p className="mt-3">RÉCUPÉO ne peut être tenu responsable des suites données par l&apos;utilisateur aux résultats fournis, ni des décisions prises sur cette base.</p>
          </Article>

          <Article title="7. Propriété intellectuelle">
            <p>L&apos;ensemble des éléments du site (textes, graphismes, logiciels, algorithmes, marques) est la propriété de RÉCUPÉO et est protégé par le droit de la propriété intellectuelle.</p>
            <p>Les rapports et courriers générés pour l&apos;utilisateur peuvent être librement utilisés par celui-ci dans le cadre de ses démarches personnelles.</p>
          </Article>

          <Article title="8. Données personnelles">
            <p>Le traitement des données personnelles est détaillé dans notre <Link href="/confidentialite" className="text-emerald hover:underline">politique de confidentialité</Link>.</p>
          </Article>

          <Article title="9. Disponibilité du service">
            <p>RÉCUPÉO s&apos;efforce d&apos;assurer la disponibilité du site 24h/24, 7j/7. Toutefois, l&apos;accès peut être temporairement suspendu pour maintenance, mise à jour ou cas de force majeure, sans que cela ouvre droit à indemnisation.</p>
          </Article>

          <Article title="10. Droit applicable et litiges">
            <p>Les présentes CGU/CGV sont régies par le droit français.</p>
            <p>En cas de litige, une solution amiable sera recherchée en priorité. À défaut, le litige sera porté devant les tribunaux compétents de Riom.</p>
            <p>Conformément à l&apos;article L.612-1 du Code de la consommation, vous pouvez recourir gratuitement au service de médiation de la consommation. Médiateur : <a href="https://www.mediation-conso.fr" target="_blank" rel="noopener noreferrer" className="text-emerald hover:underline">www.mediation-conso.fr</a></p>
          </Article>

          <div className="pt-6 border-t border-slate-border">
            <p className="text-sm text-slate-muted">Pour toute question, contactez-nous à <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a></p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <h2 className="font-heading text-xl font-bold text-navy mb-4">{title}</h2>
      <div className="text-[15px] text-slate-text/80 leading-relaxed space-y-2">{children}</div>
    </article>
  )
}
