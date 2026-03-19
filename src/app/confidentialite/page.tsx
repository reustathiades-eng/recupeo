import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — RÉCUPÉO',
  description: 'Politique de confidentialité et protection des données personnelles (RGPD) de RÉCUPÉO.',
  alternates: { canonical: 'https://recupeo.fr/confidentialite' },
}

export default function ConfidentialitePage() {
  return (
    <div className="bg-slate-bg min-h-screen">
      <section className="hero-gradient py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white">Politique de confidentialité</h1>
          <p className="text-white/50 mt-3 text-sm">Dernière mise à jour : mars 2026 — Conforme au RGPD (Règlement UE 2016/679)</p>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white rounded-2xl border border-slate-border p-8 sm:p-12 space-y-10">

          <Article title="1. Responsable de traitement">
            <p><strong>Romain EUSTATHIADES</strong> — Micro-entreprise RÉCUPÉO</p>
            <p>SIRET : <span className="text-slate-muted italic">[en cours d&apos;attribution]</span></p>
            <p>Adresse : Riom (63), France</p>
            <p>Email : <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a></p>
          </Article>

          <Article title="2. Données collectées">
            <p>Dans le cadre de l&apos;utilisation de nos services, nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Données d&apos;identification</strong> : adresse email, prénom (optionnel)</li>
              <li><strong>Données de compte</strong> : situation personnelle (propriétaire, locataire, retraité…), préférences de notifications — renseignées volontairement dans votre espace personnel</li>
              <li><strong>Données de formulaire</strong> : informations saisies dans les modules d&apos;analyse (données fiscales, montants de loyer, données de pension, état des lieux…)</li>
              <li><strong>Documents uploadés</strong> : avis d&apos;imposition, bulletins de pension, états des lieux (traités puis supprimés)</li>
              <li><strong>Données de paiement</strong> : traitées exclusivement par Stripe — RÉCUPÉO ne stocke aucune donnée bancaire</li>
              <li><strong>Données de navigation</strong> : pages visitées, actions effectuées (via Google Analytics 4)</li>
            </ul>
          </Article>

          <Article title="3. Finalités du traitement">
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Fourniture du service : analyse des documents, génération de pré-diagnostics, rapports et courriers</li>
              <li>Gestion des paiements et de la relation client</li>
              <li>Envoi d&apos;emails transactionnels (récapitulatifs, rapports)</li>
              <li>Amélioration du service et statistiques anonymisées</li>
              <li>Gestion de votre espace personnel (authentification par lien sécurisé, suivi des diagnostics et démarches)</li>
              <li>Recommandations personnalisées de services en fonction de votre profil et historique</li>
              <li>Programme de parrainage (génération de code parrain, suivi des crédits)</li>
            </ul>
          </Article>

          <Article title="4. Base légale">
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Exécution contractuelle</strong> (article 6.1.b RGPD) : traitement des données nécessaires à la fourniture du service</li>
              <li><strong>Intérêt légitime</strong> (article 6.1.f RGPD) : statistiques de fréquentation, amélioration du service</li>
              <li><strong>Consentement</strong> (article 6.1.a RGPD) : dépôt de cookies analytiques</li>
            </ul>
          </Article>

          <Article title="5. Sous-traitants et destinataires">
            <p>Vos données peuvent être transmises aux sous-traitants suivants, tous conformes au RGPD :</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-border">
                    <th className="text-left py-2 pr-4 font-semibold">Sous-traitant</th>
                    <th className="text-left py-2 pr-4 font-semibold">Rôle</th>
                    <th className="text-left py-2 font-semibold">Localisation</th>
                  </tr>
                </thead>
                <tbody className="text-slate-text/70">
                  <tr className="border-b border-slate-border/50">
                    <td className="py-2 pr-4">Anthropic (Claude API)</td>
                    <td className="py-2 pr-4">Analyse IA des documents</td>
                    <td className="py-2">États-Unis</td>
                  </tr>
                  <tr className="border-b border-slate-border/50">
                    <td className="py-2 pr-4">OVH</td>
                    <td className="py-2 pr-4">Hébergement serveur</td>
                    <td className="py-2">France</td>
                  </tr>
                  <tr className="border-b border-slate-border/50">
                    <td className="py-2 pr-4">Brevo (ex-Sendinblue)</td>
                    <td className="py-2 pr-4">Emails transactionnels</td>
                    <td className="py-2">France</td>
                  </tr>
                  <tr className="border-b border-slate-border/50">
                    <td className="py-2 pr-4">Stripe</td>
                    <td className="py-2 pr-4">Paiement sécurisé</td>
                    <td className="py-2">États-Unis / Irlande</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Google (Analytics 4)</td>
                    <td className="py-2 pr-4">Statistiques de fréquentation</td>
                    <td className="py-2">États-Unis</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">Les transferts vers les États-Unis sont encadrés par les clauses contractuelles types de la Commission européenne et/ou le EU-US Data Privacy Framework.</p>
          </Article>

          <Article title="6. Durée de conservation">
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Documents uploadés</strong> : supprimés après traitement (non conservés)</li>
              <li><strong>Données de diagnostic</strong> : 12 mois à compter de la création</li>
              <li><strong>Données de paiement</strong> : conservées par Stripe selon leurs conditions</li>
              <li><strong>Données analytiques</strong> : 14 mois (paramétrage GA4)</li>
              <li><strong>Données de compte</strong> : conservées tant que le compte est actif, supprimées 30 jours après demande de suppression</li>
              <li><strong>Documents générés</strong> (rapports, courriers) : 2 ans maximum</li>
            </ul>
          </Article>

          <Article title="7. Anonymisation">
            <p>Avant tout envoi à l&apos;API d&apos;intelligence artificielle (Anthropic Claude), les données personnelles identifiantes (noms, adresses, numéros fiscaux) sont <strong>anonymisées</strong> côté serveur. L&apos;IA ne reçoit que des données rendues non identifiantes.</p>
          </Article>

          <Article title="8. Vos droits">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-2">
              <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong>Droit de suppression</strong> : demander l&apos;effacement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
              <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données</li>
              <li><strong>Droit à la limitation</strong> : restreindre le traitement de vos données</li>
            </ul>
            <p className="mt-3">Vous pouvez exercer vos droits directement depuis votre espace personnel (Mon espace → Paramètres) : export de vos données au format JSON et demande de suppression de compte. Vous pouvez également envoyer un email à <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a>. Nous répondrons dans un délai de 30 jours.</p>
            <p>Vous disposez également du droit d&apos;introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald hover:underline">CNIL</a> (Commission Nationale de l&apos;Informatique et des Libertés).</p>
          </Article>

          <Article title="9. Sécurité">
            <p>RÉCUPÉO met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement HTTPS, serveur sécurisé (OVH, France), accès restreint aux données, anonymisation avant traitement IA.</p>
          </Article>

          <Article title="10. Cookies">
            <p>Le site utilise un cookie d'authentification (recupeo_session) strictement nécessaire au fonctionnement de votre espace personnel (httpOnly, sécurisé, durée 30 jours). Il ne contient aucune donnée personnelle lisible. Le site utilise également des cookies de mesure d&apos;audience (Google Analytics 4) paramétrés pour anonymiser les adresses IP. Aucun cookie publicitaire ou de pistage tiers n&apos;est déposé.</p>
            <p>Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.</p>
          </Article>

          <Article title="11. Modifications">
            <p>RÉCUPÉO se réserve le droit de modifier la présente politique. En cas de modification substantielle, les utilisateurs seront informés par email ou par une notification sur le site.</p>
          </Article>

          <div className="pt-6 border-t border-slate-border">
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-muted">
              <p>Questions ? <a href="mailto:contact@recupeo.fr" className="text-emerald hover:underline">contact@recupeo.fr</a></p>
              <span className="hidden sm:inline text-slate-border">|</span>
              <p><Link href="/mentions-legales" className="text-emerald hover:underline">Mentions légales</Link> · <Link href="/cgu" className="text-emerald hover:underline">CGU / CGV</Link></p>
            </div>
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
